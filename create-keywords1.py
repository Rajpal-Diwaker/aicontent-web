import pandas as pd
import pickle
from newspaper import Article
import re
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)
import os
import time

def build_article_df(urls):
    articles = []
    for index, row in urls.iterrows():
        try:
            time.sleep(2)
            print(row['url'])
            data = Article(url=row['url'])
            data.download()
            data.parse()
            try:
                data.nlp()
            except:
                pass
            kw = ",".join(str(x) for x in data.keywords)
            articles.append((kw, data.summary, row['url'], data.text, row['pubdate'], data.top_image, row['category']  ))
        except Exception as e:
            print(e)
            pass
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

