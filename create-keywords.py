import pandas as pd
import numpy as np
import pickle
from nltk.tokenize import word_tokenize, sent_tokenize
from nltk.corpus import stopwords
from nltk.stem import WordNetLemmatizer, PorterStemmer
from string import punctuation
from collections import Counter

from collections import OrderedDict
import re
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)

from html.parser import HTMLParser
from bs4 import BeautifulSoup
import os

porter = PorterStemmer()
wnl = WordNetLemmatizer() 
stop_words = stopwords.words('english')
stop_words.extend([ 'mr', 'industry', 'company', 'reserved', 'rights', 'family', 'pic.twitter.com', 'house', 'e.', 'mr.', 'found', 'thing', 'among', 'url', 'case', 'reuters', 'say', 'like', 'january', 'whether', 'inc.', 'image', 'another',' said', 'news', 'top', 'policy', 'post', 'long', 'first', 'told', 'uploads', 'root', 'year', 'summary', 'back', 'name', 'span', 'data', 'new', 'time', 'one', 'last', 'jpg', 'img', 'png', 'html', 'width', 'content', 'text', 'two', 'video', 'source', 'paragraph', 'true', 'style', 'title', 'but', 'height', 'div', 'strong', 'image', 'com', 'href', 'class', 'https', 'www', 'amp', 'said', 'would', 'http', 'src', 'target', 'blank', 'get', 'like', 'blank', 'from', 'subject', 're', 'edu', 'use', 'not', 'would', 'say', 'could', '_', 'be', 'know', 'good', 'go', 'get', 'do', 'done', 'try', 'many', 'some', 'nice', 'thank', 'think', 'see', 'rather', 'easy', 'easily', 'lot', 'lack', 'make', 'want', 'seem', 'run', 'need', 'even', 'right', 'line', 'even', 'also', 'may', 'take', 'come'])
stop = set(stop_words)

import sys
# !{sys.executable} -m spacy download en
from pprint import pprint

# Gensim
import gensim, spacy, logging, warnings
import gensim.corpora as corpora
from gensim.utils import lemmatize, simple_preprocess
from gensim.models import CoherenceModel
import matplotlib.pyplot as plt

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

class MLStripper(HTMLParser):
    def __init__(self):
        super().__init__()
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

def sent_to_words(sentences):
    for sent in sentences:
        sent = str(sent)
        sent = re.sub('\S*@\S*\s?', '', sent)  # remove emails
        sent = re.sub('\s+', ' ', sent)  # remove newline chars
        sent = re.sub("\'", "", sent)  # remove single quotes
        sent = gensim.utils.simple_preprocess(str(sent), deacc=True) 
        yield(sent)     

def clean_text(text):
    text = re.sub(r'[^a-zA-Z0-9.\']', ' ', text)
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    # text = text.lower()
    return text

def scraper(link):
    import time
    from urllib.request import urlopen
    from bs4 import BeautifulSoup 
    print(link)
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
    for sentence in sentences:
        passage += sentence.text
    passage = clean_text(passage) 
    return passage

def build_article_df(urls):
    articles = []
    for index, row in urls.iterrows():
        try:
            data = scraper(row['url'])
            # data = strip_tags(data)
            # data = str(data).strip().replace("'", "")
            # data = data.encode('ascii', 'ignore').decode('ascii')

            document = tokenizer(data)
            top_5 = get_keywords(document, 5)
          
            unzipped = list(zip(*top_5))
            kw= list(unzipped[0])
            kw=",".join(str(x) for x in kw)
            articles.append((kw, row['title'], row['url'], data, row['pubdate'], row['urlToImage'], row['category']  ))
        except Exception as e:
            print(e)
            #print data
            #break
            pass
        #break
    article_df = pd.DataFrame(articles, columns=['keywords', 'title', 'url', 'description', 'pubdate', 'urlToImage', 'category' ])
    return article_df

df = pd.read_csv('./data-model/news.csv')
data = []
for index, row in df.iterrows():
    data.append((row['title'], row['url'], row['publishedAt'], row['description'], row['urlToImage'], row['category']))
data_df = pd.DataFrame(data, columns=['title' ,'url', 'pubdate', 'text', 'urlToImage', 'category' ])

article_df = build_article_df(data_df)

filename = 'data-model/scrapped_df_other.pkl'
folder = os.path.dirname(os.path.abspath(__file__))
filepath = os.path.join(folder, filename)

with open(filepath, 'wb') as fout:
    print("file created")
    pickle.dump(article_df, fout)

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

co_occur = pd.DataFrame.from_dict(occurrences )

co_occur.to_csv('data-model/co-occurency-matrix.csv')