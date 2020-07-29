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

with open('data-model/cognizant.txt', 'r') as in_file:
    stripped = (line.strip() for line in in_file)
    lines = (line.split(",") for line in stripped if line)
    with open('data-model/cognizant.csv', 'w') as out_file:
        writer = csv.writer(out_file)
        writer.writerows(lines)

#loading the data
df = pd.read_csv("data-model/cognizant.csv", sep = "\t")
df.columns = ["sentences"]
df.head()

df['content'] = df['sentences']
df.drop(columns=['sentences'], inplace=True)

f = open('data-model/df.pkl', 'wb')
pickle.dump(df, f)
f.close()