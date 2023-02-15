
import requests
import newspaper
from newspaper import Article
from xml.etree import ElementTree
from py2neo import Graph

graph = Graph(password="Techugo@1234")

def writeToGraph(article):
    insert_tx = graph.begin()
    insert_tx.run('''
    MERGE (u:URL {url: {url}})
    SET u.title = {title}
    FOREACH (keyword IN {keywords} | MERGE (k:Keyword {text: keyword}) CREATE UNIQUE (k)<-[:IS_ABOUT]-(u) )
    FOREACH (img IN {images} | MERGE (i:Image {url: img})<-[:WITH_IMAGE]-(u) )   
    ''', article)
    insert_tx.commit()

def newspaper_article(url):
    print(url)
    import time
    time.sleep(2)

    try:
        article = Article(url)
        article.download()
        article.parse()
    except:
        pass    

    try:
        html_string = ElementTree.tostring(article.clean_top_node)
    except:
        html_string = "Error converting HTML to string"

    try:
        article.nlp()
    except:
        pass

    return {
        'url': url,
        'authors': article.authors,
        'title': article.title,
        'top_image': article.top_image,
        'keywords': article.keywords,
        'images': filter_images(list(article.images))
    }   

def filter_images(images):
    imgs = []
    for img in images:
        if img.startswith('http'):
            imgs.append(img)
    return imgs             

import pandas as pd
df = pd.read_csv('./data-model/news.csv')

for index, row in df.iterrows():
    parsed_a = newspaper_article(row['url'])
    writeToGraph(parsed_a)
