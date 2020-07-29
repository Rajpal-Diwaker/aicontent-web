import pandas as pd
import re
from nltk.tokenize import word_tokenize
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import CountVectorizer
import csv

with open('data-model/cognizant.txt', 'r') as in_file:
    stripped = (line.strip() for line in in_file)
    lines = (line.split(",") for line in stripped if line)
    with open('data-model/cognizant.csv', 'w') as out_file:
        writer = csv.writer(out_file)
        writer.writerows(lines)

#loading the data
sentence_data = pd.read_csv("data-model/cognizant.csv", sep = "\t")
sentence_data.columns = ["sentences"]
sentence_data.head()

#prepare the data
def clean_data(sentence):
    sentence = re.sub("[^A-Za-z]", " ", sentence)
    sentence = sentence.lower()
    sentence = word_tokenize(sentence)
    stemmer = PorterStemmer()
    sentence = [stemmer.stem(word) for word in sentence if word not in set(stopwords.words("english"))]
    sentence = " ".join(sentence)
    return sentence

sentences = sentence_data.sentences[0]
cleaned_data = clean_data(sentences) 

corpus = []
for i in range(0, len(cleaned_data)):
    sentence = clean_data(sentence_data.sentences[i])
    corpus.append(sentence)

count_vectorizer = CountVectorizer()
features = count_vectorizer.fit_transform(corpus).toarray()
