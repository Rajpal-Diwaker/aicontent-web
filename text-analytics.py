import pandas as pd
import numpy as np
 
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer, PorterStemmer
from string import punctuation
from collections import Counter
 
from collections import OrderedDict
import re
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
 
# from HTMLParser import HTMLParser
from urllib.request import urlopen
from bs4 import BeautifulSoup
import pickle
import time

wnl = WordNetLemmatizer() 
stop = stopwords.words('english')
stop = set(stop)

def tokenizer(text):
    tokens_ = [word_tokenize(sent) for sent in sent_tokenize(text)]

    tokens = []
    for token_by_sent in tokens_:
        tokens += token_by_sent

    tokens = list(filter(lambda t: t.lower() not in stop, tokens))
    tokens = list(filter(lambda t: t not in punctuation, tokens))
    tokens = list(filter(lambda t: t not in [u"'s", u"n't", u"...", u"''", u'``', u'\u2014', u'\u2026', u'\u2013'], tokens))
     
    filtered_tokens = []
    for token in tokens:
        token = wnl.lemmatize(token)
        if re.search('[a-zA-Z]', token):
            filtered_tokens.append(token)

    filtered_tokens = list(map(lambda token: token.lower(), filtered_tokens))

    return filtered_tokens


class MLStripper():
    def __init__(self):
        self.reset()
        self.fed = []
    def handle_data(self, d):
        self.fed.append(d)
    def get_data(self):
        return ''.join(self.fed)

def strip_tags(html):
    s = MLStripper()
    s.feed(html)
    return s.get_data()

def get_keywords(tokens, num):
    return Counter(tokens).most_common(num)

uri_dict = {
    'mckinsey': [
        "industries/advanced-electronics/our-insights"
#     , "industries/electric-power-and-natural-gas/our-insights"
#     , "industries/private-equity-and-principal-investors/our-insights",
# "industries/aerospace-and-defense/our-insights", "industries/financial-services/our-insights", "industries/public-sector/our-insights", "industries/agriculture/our-insights", "industries/healthcare-systems-and-services/our-insights",
# "industries/retail/our-insights", "industries/automotive-and-assembly/our-insights", "industries/metals-and-mining/our-insights", "industries/semiconductors/our-insights", "industries/capital-projects-and-infrastructure/our-insights",
# "industries/oil-and-gas/our-insights", "industries/social-sector/our-insights", "industries/chemicals/our-insights", "industries/paper-forest-products-and-packaging/our-insights", "industries/technology-media-and-telecommunications/our-insights",
# "industries/consumer-packaged-goods/our-insights", "industries/pharmaceuticals-and-medical-products/our-insights", "industries/travel-transport-and-logistics/our-insights"
]}

def build_article_df():
    for domain in uri_dict:
        for keyword in uri_dict[domain]:  
            page = urlopen("https://www."+domain+".com/" + keyword).read()
            soup = BeautifulSoup(page, features="html.parser")
            links = soup.findAll("a", {"class": "item-title-link"})
        
        articles = []
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
                try:
                    data = sentences.strip().replace("'", "")
                    data = strip_tags(data)
                    soup = BeautifulSoup(data)
                    data = soup.get_text()
                    data = data.encode('ascii', 'ignore').decode('ascii')
                    document = tokenizer(data)
                    top_5 = get_keywords(document, 5)
                
                    unzipped = zip(*top_5)
                    kw= list(unzipped[0])
                    kw=",".join(str(x) for x in kw)
                    articles.append((kw, date))
                except Exception as e:
                    print(e)
                    #print data
                    #break
                    pass 
    article_df = pd.DataFrame(articles, columns=['keywords', 'pubdate'])

    f = open('data-model/scrapped_df_other.pkl', 'wb')
    pickle.dump(article_df, f)
    f.close()

    return article_df

article_df = build_article_df()

pickle_in = open("data-model/scrapped_df_other.pkl","rb") 
df = pickle.load(pickle_in) 

keywords_array=[]
for index, row in article_df.iterrows():
    keywords=row['keywords'].split(',')
    for kw in keywords:
        keywords_array.append((kw.strip(' '), row['keywords']))

kw_df = pd.DataFrame(keywords_array).rename(columns={0:'keyword', 1:'keywords'})

document = kw_df.keywords.tolist()
names = kw_df.keyword.tolist()

document_array = []
for item in document:
    items = item.split(',')
    document_array.append((items))

occurrences = OrderedDict((name, OrderedDict((name, 0) for name in names)) for name in names)

for l in document_array:
    for i in range(len(l)):
        for item in l[:i] + l[i + 1:]:
            occurrences[l[i]][item] += 1

co_occur = pd.DataFrame.from_dict(occurrences)

co_occur.to_csv('data-model/co-occurancy_matrix.csv')