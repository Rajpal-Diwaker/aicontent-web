

import re
import csv
import pickle
import time
import pprint
from collections import Counter
from datetime import datetime, timedelta
from urllib.request import urlopen
from bs4 import BeautifulSoup  
import pandas as pd

import spacy
# !python -m spacy download en_core_web_md
spacy_nlp = spacy.load('en_core_web_lg')
from spacy.lang.en import English
nlp = English()
# spacy.prefer_gpu()

uri_dict = {
    'mckinsey': [
        "industries/advanced-electronics/our-insights"
    , "industries/electric-power-and-natural-gas/our-insights"
    , "industries/private-equity-and-principal-investors/our-insights",
"industries/aerospace-and-defense/our-insights", "industries/financial-services/our-insights", "industries/public-sector/our-insights", "industries/agriculture/our-insights", "industries/healthcare-systems-and-services/our-insights",
"industries/retail/our-insights", "industries/automotive-and-assembly/our-insights", "industries/metals-and-mining/our-insights", "industries/semiconductors/our-insights", "industries/capital-projects-and-infrastructure/our-insights",
"industries/oil-and-gas/our-insights", "industries/social-sector/our-insights", "industries/chemicals/our-insights", "industries/paper-forest-products-and-packaging/our-insights", "industries/technology-media-and-telecommunications/our-insights",
"industries/consumer-packaged-goods/our-insights", "industries/pharmaceuticals-and-medical-products/our-insights", "industries/travel-transport-and-logistics/our-insights"
]}

def clean_text(text):
    text = re.sub(r'[^a-zA-Z\']', ' ', text)
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    text = text.lower()
    return text

def sentence_tokenizer(text):
    sbd = nlp.create_pipe('sentencizer')
    nlp.add_pipe(sbd)
    doc = nlp(text)

    sents_list = []
    for sent in doc.sents:
        sents_list.append(sent.text)
    return sents_list  

def word_tokenizer(text):
    my_doc = nlp(text)

    token_list = []
    for token in my_doc:
        token_list.append(token.text)    
    return token_list    

def cleanup(token, lower = True):
    if lower:
       token = token.lower()
    return token.strip()

def entity_extraction(text):
    doc = nlp(text)
    labels = set([w.label_ for w in doc.ents]) 
    entities = []
    for label in labels: 
        entities = [cleanup(e.string, lower=False) for e in doc.ents if label==e.label_] 
        entities = list(set(entities)) 
    
    return labels  

def labelling(text):
    text = clean_text(text)
    sent_list = word_tokenizer(text)

    from spacy.lang.en.stop_words import STOP_WORDS

    filtered_sentence = [] 

    for sent in sent_list:
        lexeme = nlp.vocab[sent]
        if lexeme.is_stop == False:
            filtered_sentence.append(sent)
    return filtered_sentence              

def scraper():
    date_sentiments = {}
    article_text = {}
    counter = 1
    for domain in uri_dict:
        for keyword in uri_dict[domain]: 
            print(keyword)   
            page = urlopen( "https://www."+domain+".com/" + keyword ).read()
            soup = BeautifulSoup(page, features="html.parser")
            links = soup.findAll("a", {"class": "item-title-link"})

            for link in links:
                print(link)
                time.sleep(2)
                url = "https://www."+domain+".com"+link.get('href')
                try:
                    link_page = urlopen(url).read()
                except:    
                    pass
                link_soup = BeautifulSoup(link_page, features="html.parser")
                sentences = link_soup.findAll("p")
                dates = link_soup.findAll("time")
                try:
                    date = dates[0].text
                except:    
                    pass
                passage = ""
                for sentence in sentences:
                    passage += sentence.text 
                passage = clean_text(passage)
                article_text.setdefault(date, []).append(passage) 
                # break 
    articles = {}
    for k,v in article_text.items():
        # whole = spacy_nlp(v[0])
        # labels = [spacy.explain(x.label_) for x in whole.ents]
        labels = labelling(v[0])
        articles['tokens'] = labels 
        articles['article'] = v[0] 
        df = pd.DataFrame(articles) 
    return df

articless = scraper()

f = open('data-model/scrapped_df.pkl', 'wb')
pickle.dump(articless, f)
f.close()


