from flask import Flask, request, jsonify
from flask_cors import CORS
import nltk as nltk
import re
import csv
import time
from collections import Counter
from datetime import datetime, timedelta
from urllib.request import urlopen
from bs4 import BeautifulSoup  

app = Flask(__name__)
cors = CORS(app, resources={r"/api/*": {"origins": "*"}})

def remove_html_tags(text):
    """Remove html tags from a string"""
    clean = re.compile('<.*?>')
    return re.sub(clean, '', text)

def clean_text(text):
    try:
        text = remove_html_tags(text)
        text = re.sub(r'[^-a-zA-Z0-9.,\']', ' ', text)
        text = re.sub(r'[^\x00-\x7F]+', '', text)
        # text = text.lower()
    except:
        pass    
    return text

def nel(text):
    import requests
    from IPython.core.display import display, HTML
    # An API Error Exception
    class APIError(Exception):
        def __init__(self, status):
            self.status = status
        def __str__(self):
            return "APIError: status={}".format(self.status)
        
    # Base URL for Spotlight API
    base_url = "http://api.dbpedia-spotlight.org/en/annotate"
    # Parameters 
    # 'text' - text to be annotated 
    # 'confidence' -   confidence score for linking
    params = {"text": text, "confidence": 0.35}
    # Response content type
    headers = {'accept': 'text/html'}
    # GET Request
    res = requests.get(base_url, params=params, headers=headers)
    if res.status_code != 200:
        # Something went wrong
        raise APIError(res.status_code)
    # Display the result as HTML in Jupyter Notebook
    return res.text  

def scraper(link):
    time.sleep(2)
    url = link
    link_page = ''
    try:
        link_page = urlopen(url).read()
    except:    
        pass
    link_soup = BeautifulSoup(link_page, features="html.parser")
    sentences = link_soup.findAll("p")
        
    passage = ""
    for sent in sentences:
        try:
            passage += sent.text 
            passage += "\n\n"
        except:
            pass     
    passage = clean_text(passage)
   
    return passage

def summarize(article_text):
    stopwords = nltk.corpus.stopwords.words('english')

    formatted_article_text = re.sub('^[a-zA-Z0-9]+$', ' ', article_text)
    formatted_article_text = re.sub(r'\s+', ' ', formatted_article_text) 

    word_frequencies = {}
    for word in nltk.word_tokenize(formatted_article_text):
        if word not in stopwords:
            if word not in word_frequencies.keys():
                word_frequencies[word] = 1
            else:
                word_frequencies[word] += 1
    
    maximum_frequncy = max(word_frequencies.values())

    for word in word_frequencies.keys():
        word_frequencies[word] = (word_frequencies[word]/maximum_frequncy)

    sentence_list = nltk.sent_tokenize(article_text)
    sentence_scores = {}
    for sent in sentence_list:
        for word in nltk.word_tokenize(sent.lower()):
            if word in word_frequencies.keys():
                if len(sent.split(' ')) < 30:
                    if sent not in sentence_scores.keys():
                        sentence_scores[sent] = word_frequencies[word]
                    else:
                        sentence_scores[sent] += word_frequencies[word]  

                        
    import heapq
    summary_sentences = heapq.nlargest(7, sentence_scores, key=sentence_scores.get)

    summary = ' '.join(summary_sentences)

    summary = re.sub('^[a-zA-Z0-9]+$', ' ', summary )
    summary = re.sub(r'\s+', ' ', summary)
    return summary

def _removeNonAscii(s): 
    return "".join(i for i in s if ord(i)<128)

def removeStopwords(token_list):
    from spacy.lang.en import English
    nlp = English()
    from spacy.lang.en.stop_words import STOP_WORDS

    filtered_sentence = [] 

    nlp.vocab["company"].is_stop = True
    nlp.vocab["trends"].is_stop = True
    nlp.vocab["trend"].is_stop = True
    nlp.vocab["development"].is_stop = True
    nlp.vocab["growth"].is_stop = True

    for word in token_list:
        lexeme = nlp.vocab[word]
        if lexeme.is_stop == False:
            filtered_sentence.append(word) 
    return filtered_sentence     

def rasaEntities(user_query):
    from rasa_nlu.model import Metadata, Interpreter

    model_directory = './models/current/nlu'
    interpreter = Interpreter.load(model_directory)

    interpreted_dict = interpreter.parse(user_query)

    entities_extracted = []
    for key, value in interpreted_dict.items(): 
        if(key == "entities"):
            if(len(value)>0 and value[0]['confidence'] > 0.80):
                entities_extracted = value  
    return entities_extracted      

@app.route('/api/summaryArticle', methods=['POST'])
def summaryArticle():
    summarizedIntro = ''
    summarizedBody = ''
    summarizedConclusion = ''
    try:
        intro = request.json.get('intro').strip()
        body = request.json.get('body').strip()
        conclusion = request.json.get('conclusion').strip()
        charLen = request.json.get('charLen') 

        if(charLen == 'max'):
            summarizedIntro = intro
        else:
            summarizedIntro = summarize(intro)    
        summarizedBody = body

        if(charLen == 'max'):
            summarizedConclusion = conclusion
        else:
            summarizedConclusion = summarize(conclusion) 

    except:
        pass

    if(summarizedIntro == ''):
        summarizedIntro = intro 

    if(summarizedBody == ''):
        summarizedBody = body

    if(summarizedConclusion == ''):
        summarizedConclusion = conclusion   


    statistics = []
    userQuery = request.json.get('userQuery')
    contentTypes = request.json.get('contentTypes')
    contentTypeCheck = set(contentTypes) 

    if 'Statistics' in contentTypeCheck: 
        print ("Statistics Exists")  
        from pattern.web import Google, URL, plaintext
        svgList = []
        google = Google(license=None)
       
        if(True):
            for search_result in google.search("Statistics of "+userQuery):
        
                url = search_result.url


                try:
                    link_page = urlopen(url).read()
                except:    
                    pass
                
                try:
                    link_soup = BeautifulSoup(link_page, features="html.parser")
                    article = link_soup.findAll("div")
                
                    table = [i.find('table') for i in article if (i.find('table') != None)]
                    
                    if(len(table)>0):
                        if(table[0] != None):
                            statistics.append(str(table[0]))
                        if(len(table)>=1 and table[1] != None):  
                            statistics.append(str(table[1]))            
                except:
                    pass 

    imgList = []                
    if 'Images' in  contentTypeCheck:  
        print ("Images Exists") 
        try:
            from pattern.web import Google, URL, plaintext

            google = Google(license=None)
        
            if(True):
                for search_result in google.search("Images of " + userQuery):
            
                    url = search_result.url
                    from newspaper import Article
                    data = Article(url=url)
                    data.download()
                    data.parse()
                    data.nlp()
                    imgList.append(data.top_image)       
        except:
            pass                               

    return jsonify({ "results": { "introduction": summarizedIntro, "body": summarizedBody, "conclusion": summarizedConclusion, "statistics": statistics, "images": imgList  } }) 


@app.route('/api/topicSuggestions', methods=['POST'])
def topicSuggestions():
    keywords = []
    synonyms = [] 
    try:
        user_query = request.json.get('topic').strip().lower()
        
        from py2neo import Graph
        graph = Graph(password="Techugo@1234")

        entities = rasaEntities(user_query)

        qry = ''
        userSplited = entities
        if(len(userSplited)==0):
            userSplited = user_query.split(" ")

        for keyword in userSplited:
            qry += " toLower(n.text) CONTAINS '" +keyword+ "' "

        keywords = graph.run("MATCH (n:Keyword) WHERE "+qry+"  RETURN n LIMIT 3").data()

        import nltk 
        from nltk.corpus import wordnet 
                    
        for ss in wordnet.synsets(user_query):
            for syn in ss.lemma_names():
                synonyms.append(syn)
        synonyms = list(set(synonyms))
    except:
        pass
    return jsonify({ "results": { "keywords": (keywords + synonyms) } })                  

@app.route('/api/userQuery', methods=['POST'])
def userQuery():
    import pickle 
    user_query = request.json.get('topic').strip().lower()
    contentTypes = request.json.get('contentTypes')
    industryType = request.json.get('industryType')
    lang = request.json.get('lang')

    intro = ""

    try:
        # from ibm_watson import DiscoveryV1
        # from ibm_cloud_sdk_core.authenticators import IAMAuthenticator

        # authenticator = IAMAuthenticator('FRDJkAQHEYaS60oA2xWIuyiDYV5OZy8cq39CIO9XqH6C')
        # discovery = DiscoveryV1(
        #             version='2018-12-03',
        #             authenticator=authenticator
        #         )

        # discovery.set_service_url('https://api.us-east.discovery.watson.cloud.ibm.com/instances/a607376e-f525-41dd-ba40-d49dc3cfaa97')

        # response = discovery.query(
        #     environment_id='system',
        #     collection_id='news-en',
        #     deduplicate=False,
        #     highlight=True,
        #     passages=True,
        #     natural_language_query=user_query
        # )
        # intro = response.get_result()['results'][0]['text']
        
        intro = ""
        urlllll = ""
        from pattern.web import Google, plaintext

        google = Google(license=None)
        for search_result in google.search(user_query):
            print(search_result)
            intro = plaintext(search_result.text)
            urlllll = search_result.url
            break
    except:
        pass    

    finalList = []  
    finalListStr = ''
    # for key, value in response.get_result().items():
    #     if(key == 'text' and value != ""):
    #         print(value)
   
    entities_extracted = rasaEntities(user_query)

    pickle_in = open("data-model/scrapped_df_other.pkl","rb") 
    df = pickle.load(pickle_in) 
    df = df.dropna().reset_index(drop=True) 

    # pickle_inn = open("data-model/df_dominant_topic.pkl","rb") 
    # dff = pickle.load(pickle_inn) 
    # dff = dff.dropna().reset_index(drop=True) 

    if len(entities_extracted) == 0:
        import spacy
        from spacy.matcher import Matcher

        nlp = spacy.load('en_core_web_md')
        matcher = Matcher(nlp.vocab)

        doc = nlp(user_query)

        token_texts = [token.text for token in doc]
        pos_tags = [token.pos_ for token in doc]
        entities=[(i, i.label_, i.label) for i in doc.ents]

        for i, val in enumerate(entities): 
           entities_extracted.append(val[0].text)  

        for index, pos in enumerate(pos_tags):
            if pos == "PROPN":
                if pos_tags[index] == "VERB":
                    result = token_texts[index]
                    entities_extracted.append(result[0].text)     

        pattern = [{"POS": "ADJ"}, {"POS": "NOUN"}, {"POS": "NOUN", "OP": "?"}]

        matcher.add("ADJ_NOUN_PATTERN", None, pattern)
        matches = matcher(doc)

        for match_id, start, end in matches:
            entities_extracted.append(doc[start:end].text) 
    passFlag=False
    imggggg = ""
  
    if len(entities_extracted) == 0:
        print("=========?+++++++++++++========")
        print(urlllll)
        if(urlllll != ""):
            from newspaper import Article
            data1 = Article(url=urlllll)
            data1.download()
            data1.parse()
            data1.nlp()
            imggggg = data1.top_image
            finalList.append(data1.text)
            passFlag = True

        # user_query = _removeNonAscii(user_query)
        # entities_extracted = user_query.split()
        # entities_extracted = removeStopwords(entities_extracted) 

    imgList = []  
    if(passFlag == False):
        from fuzzywuzzy import process
        sttrr = ''
        formattedStr = ''
        for i, val in enumerate(entities_extracted):
            if isinstance(val, dict):
                val = val.get('entity')
            val += " "   
            formattedStr = " toLower(u.title) CONTAINS '"+val+"' " 
            # "toLower(u.title) CONTAINS 'wytaliba' AND toLower(u.title) CONTAINS 'financial' AND toLower(u.title) CONTAINS 'aid' " 
            sttrr += val
        sttrr = re.sub('[^a-zA-Z ]', ' ', sttrr )

        try:
            if(formattedStr != ''):
                from py2neo import Graph
                graph = Graph(password="Techugo@1234")

                graphData = graph.run("MATCH p=(u:URL)-[r:IS_ABOUT]->(k:Keyword) WHERE "+formattedStr+" RETURN u.url LIMIT 1").data()
                
                print(graphData)
                if len(graphData)>0:
                    url = graphData[0]['u.url']
                    print(url)
                    if(url != ''):
                        scrapped = scraper(url)
                        if(scrapped != ''):
                            finalListStr = scrapped 

                print("=============graphData=============")

                # MATCH p=(u:URL)-[r:WITH_IMAGE]->(i:Image) WHERE toLower(u.title) CONTAINS 'coronavirus' AND toLower(u.title) CONTAINS 'wuhan'AND toLower(u.title) CONTAINS 'china' RETURN i.url LIMIT 25
                # testtt = graph.run("MATCH p=(u:URL)-[r:IS_ABOUT]->(k:Keyword {text: {x}}) WHERE u.title CONTAINS {y} RETURN u.title LIMIT 25", x='coronavirus', y='China').data()
            
        except Exception as e:
            print(e)
            pass 

        str2Match = sttrr
        strOptions = df["keywords"].tolist()
        highest = process.extractOne(str2Match,strOptions)

        idx = strOptions.index(highest[0])

        # strOptions1 = dff["Keywords"].tolist()
        
        # highest1 = process.extractOne(str2Match,strOptions1)
        # idx1 = strOptions1.index(highest1[0])    

        # if(highest1[1]>50):
        #     finalList.append(dff.iloc[idx1]['Text'])  
    
        if(highest[1]>85):
            finalList.append(df.iloc[idx]['description'])
    
    test_list_sett = set(contentTypes) 
    
    if 'Images' in test_list_sett : 
        print ("Images Exists") 
        if(passFlag == False):
            imgList.append(df.iloc[idx]['urlToImage'])
        else:
            if(imggggg != ""):
                imgList.append(imggggg)      

    if finalListStr == '':
        finalListStr = ' '.join([str(elem) for elem in finalList])

    if finalListStr == '':
        # import json 
        # import os
        # import numpy as np
        # import tensorflow as tf
        # # os.chdir('gpt-2/src')
        # from gpt2.src import model, sample, encoder
        
        def interact_model(
            model_name,
            seed,
            nsamples,
            batch_size,
            length,
            temperature,
            top_k,
            models_dir
        ):
            models_dir = os.path.expanduser(os.path.expandvars(models_dir))
            if batch_size is None:
                batch_size = 1
            assert nsamples % batch_size == 0

            enc = encoder.get_encoder(model_name, models_dir)
            hparams = model.default_hparams()
            with open(os.path.join(models_dir, model_name, 'hparams.json')) as f:
                hparams.override_from_dict(json.load(f))

            if length is None:
                length = hparams.n_ctx // 2
            elif length > hparams.n_ctx:
                raise ValueError("Can't get samples longer than window size: %s" % hparams.n_ctx)

            with tf.Session(graph=tf.Graph()) as sess:
                context = tf.placeholder(tf.int32, [batch_size, None])
                np.random.seed(seed)
                tf.set_random_seed(seed)
                output = sample.sample_sequence(
                    hparams=hparams, length=length,
                    context=context,
                    batch_size=batch_size,
                    temperature=temperature, top_k=top_k
                )

                saver = tf.train.Saver()
                ckpt = tf.train.latest_checkpoint(os.path.join(models_dir, model_name))
                saver.restore(sess, ckpt)

                # while True:
                #     raw_text = user_query
                #     while not raw_text:
                raw_text = user_query
                context_tokens = enc.encode(raw_text)
                generated = 0
                for _ in range(nsamples // batch_size):
                    out = sess.run(output, feed_dict={
                        context: [context_tokens for _ in range(batch_size)]
                    })[:, len(context_tokens):]
                    for i in range(batch_size):
                        generated += 1
                        text = enc.decode(out[i])
                        print("=" * 40 + " SAMPLE " + str(generated) + " " + "=" * 40)
                        finalListStr = text
                        break
                    break 
            return finalListStr       
            # os.chdir('../..')    

        # finalListStr = interact_model(
        #     '345M',
        #     None,
        #     1,
        #     1,
        #     300,
        #     1,
        #     0,
        #     'gpt2/models'
        # )
    conclusion = ""
    strrr = ""
    if(finalListStr != ""):   
        conclusion = summarize(finalListStr)

    from googletrans import Translator
    translator = Translator()
    if(lang == ""):
        lang = "en"

    if(intro == ""):
        print("intro is empty") 
        finalListStrList = finalListStr.split(".")
        try:     
            intro = finalListStrList[0] + finalListStrList[1]
        except:
            pass     

    if(lang != "en"):
        print(lang)
        print("=========")
        strrrrqq = ""
        if(conclusion != ""):
            translations_conclusion = translator.translate(conclusion.split("."), dest=lang)
            for translation in translations_conclusion:
                strrrrqq += " "
                strrrrqq += translation.text

            if(strrrrqq != ""):
                conclusion = strrrrqq

        strrrrqqaa = ""
        if(intro != ""):
            translations_intro = translator.translate(intro.split("."), dest=lang)
            for translation in translations_intro:
                strrrrqqaa += " "
                strrrrqqaa += translation.text

            if(strrrrqqaa != ""):
                intro = strrrrqqaa                           

        strrrr = ""
        if(finalListStr != ""):
            translations = translator.translate(finalListStr.split("."), dest=lang)
            for translation in translations:
                strrrr += " "
                strrrr += translation.text
                strrrr += "."

        if(strrrr != ""):
            finalListStr = strrrr     


    if(finalListStr == ""):
        print("under the last option...")
        from pattern.web import Google, URL, plaintext

        google = Google(license=None)
        for search_result in google.search(user_query):
            html_content = URL(search_result.url).download()
            sentences = plaintext(html_content.decode('utf-8'))

            listt = sentences.split(".")

            passage = ""
            for sentence in listt:
                passage += sentence 
                passage = clean_text(passage)

            finalListStr = passage    
            break

    test_list_set = set(contentTypes) 
    tweetList = []
    if 'Quotes' in test_list_set : 
        print ("Quotes Exists")  
        from pattern.web import Twitter

        twitter = Twitter()
        index = None
        for j in range(3):
            for tweet in twitter.search(user_query, start=index, count=3):
                tweetList.append(tweet.text)
                index = tweet.id        

    statistics = []
    imgListt = []
    if 'Statistics' in test_list_set : 
        print ("Statistics Exists")  
        from pattern.web import Google, URL, plaintext
        svgList = []
        google = Google(license=None)
        qrzz = ' '.join(entities_extracted)
        if(True):
            if(qrzz == ''):
                qrzz = user_query

            for search_result in google.search("Statistics of "+qrzz):
        
                url = search_result.url 
            
                print("==========Search result==============")

                try:
                    link_page = urlopen(url).read()
                except:    
                    pass
                
                try:
                    link_soup = BeautifulSoup(link_page, features="html.parser")
                    article = link_soup.findAll("article")

                    section = link_soup.findAll("section")
                    print(section)
                
                    table = [i.find('table') for i in article]
                    table1 = [j.find('table') for j in section]

                    if(len(table1)>0):
                        if(table1[0] != None):
                            imgListt.append(str(table1[0]))
                        if(len(table1)>=1 and table1[1] != None):  
                            imgListt.append(str(table1[1]))

                    if(len(table)>0):
                        if(table[0] != None):
                            imgListt.append(str(table[0]))
                        if(len(table)>=1 and table[1] != None):  
                            imgListt.append(str(table[1]))               
                except:
                    pass    
            
            statistics = imgListt   
    finalListStr = re.sub(r'\[\[(?:[^\]|]*\|)?([^\]|]*)\]\]', r'\1', finalListStr)  

    if intro != '':
        intro = intro.replace('...', '')
        introList = intro.split('.')
        leng = len(introList)
        intro = ''

        for i in range(len(introList)):
            if(i!=(leng-1)):
                intro += ' '
                intro += introList[i]
                intro += '.'         

    return jsonify({"results": [{ "statistics": statistics, "text": finalListStr, "conclusion": conclusion, "images": imgList, "introduction": intro, "tweetList": tweetList }] } )

if __name__ == '__main__':
    app.debug = True
    app.run(host='0.0.0.0', port=5453)
