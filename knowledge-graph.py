from pprint import pprint
import re 
import string 
import nltk 
import spacy 
spacy_nlp = spacy.load('en_core_web_md')
import pandas as pd 
import numpy as np 
import math 
from tqdm import tqdm 

from spacy.matcher import Matcher 
from spacy.tokens import Span 
from spacy import displacy 
import pickle
import networkx as nx
import matplotlib.pyplot as plt
import random

# import pynq 

pd.set_option('display.max_colwidth', 200)

nlp = spacy.load("en_core_web_md")

text = "Digital transformation in retail banking" 

doc = nlp(text)

# for tok in doc: 
#   print(tok.text, "-->",tok.dep_,"-->", tok.pos_)

def subtree_matcher(doc):
  subjpass = 0

  for i,tok in enumerate(doc):
    # find dependency tag that contains the text "subjpass"    
    if tok.dep_.find("subjpass") == True:
      subjpass = 1

  x = ''
  y = ''

  # if subjpass == 1 then sentence is passive
  if subjpass == 1:
    for i,tok in enumerate(doc):
      if tok.dep_.find("subjpass") == True:
        y = tok.text

      if tok.dep_.endswith("obj") == True:
        x = tok.text
  
  # if subjpass == 0 then sentence is not passive
  else:
    for i,tok in enumerate(doc):
      if tok.dep_.endswith("subj") == True:
        x = tok.text

      if tok.dep_.endswith("obj") == True:
        y = tok.text

  return x,y 


def get_entities(sent):
  ent1 = ""
  ent2 = ""

  prv_tok_dep = ""    
  prv_tok_text = ""  

  prefix = ""
  modifier = ""
  
  for tok in nlp(sent):
    if tok.dep_ != "punct":
      if tok.dep_ == "compound":
        prefix = tok.text
        if prv_tok_dep == "compound":
          prefix = prv_tok_text + " "+ tok.text
      
      if tok.dep_.endswith("mod") == True:
        modifier = tok.text
        if prv_tok_dep == "compound":
          modifier = prv_tok_text + " "+ tok.text
      
      if tok.dep_.find("subj") == True:
        ent1 = modifier +" "+ prefix + " "+ tok.text
        prefix = ""
        modifier = ""
        prv_tok_dep = ""
        prv_tok_text = ""  

      if tok.dep_.find("obj") == True:
        ent2 = modifier +" "+ prefix +" "+ tok.text
        
      prv_tok_dep = tok.dep_
      prv_tok_text = tok.text

  return [ent1.strip(), ent2.strip()]  

entity_pairs = get_entities(text)

def get_relation(sent):
    my_list = [] 
    doc = nlp(sent)

    pattern = [{'DEP':'amod', 'OP':"?"},
           {'POS':'NOUN'},
           {'LOWER': 'such'},
           {'LOWER': 'as'},
           {'POS': 'PROPN'}]

    matcher = Matcher(nlp.vocab) 
    matcher.add("matching_1", None, pattern) 

    matches = matcher(doc) 
    if len(matches) > 0:
        k = len(matches) - 1
        span = doc[matches[k][1]:matches[k][2]]          
        my_list.append(span.text) 

    pattern1 = [{'DEP':'amod', 'OP':"?"}, 
            {'POS':'NOUN'}, 
            {'LOWER': 'and', 'OP':"?"}, 
            {'LOWER': 'or', 'OP':"?"}, 
            {'LOWER': 'other'}, 
            {'POS': 'NOUN'}] 
    matcher2 = Matcher(nlp.vocab)           
    matcher2.add("matching_2", None, pattern1) 

    matches2 = matcher2(doc) 
    if len(matches2) > 0:
        k2 = len(matches2) - 1
        span2 = doc[matches2[k2][1]:matches2[k2][2]] 
        my_list.append(span2.text)

    matcher3 = Matcher(nlp.vocab) 

    pattern3 = [{'DEP':'nummod','OP':"?"}, 
            {'DEP':'amod','OP':"?"}, 
            {'POS':'NOUN'}, 
            {'IS_PUNCT': True}, 
            {'LOWER': 'including'}, 
            {'DEP':'nummod','OP':"?"}, 
            {'DEP':'amod','OP':"?"}, 
            {'POS':'NOUN'}] 
                                
    matcher3.add("matching_3", None, pattern3) 

    matches3 = matcher3(doc) 
    if len(matches3) > 0:
        k3 = len(matches3) - 1
        span3 = doc[matches3[k3][1]:matches3[k3][2]]
        my_list.append(span3.text)

    matcher4 = Matcher(nlp.vocab)

    pattern4 = [{'DEP':'nummod','OP':"?"}, 
            {'DEP':'amod','OP':"?"}, 
            {'POS':'NOUN'}, 
            {'IS_PUNCT':True}, 
            {'LOWER': 'especially'}, 
            {'DEP':'nummod','OP':"?"}, 
            {'DEP':'amod','OP':"?"}, 
            {'POS':'NOUN'}] 
            
    matcher4.add("matching_4", None, pattern4) 

    matches4 = matcher4(doc) 
    if len(matches4) > 0:
        k4 = len(matches4) - 1
        span4 = doc[matches4[k4][1]:matches4[k4][2]] 
        my_list.append(span4.text)

    return(my_list)

with open('data-model/scrapped_df_other.pkl', 'rb') as f:
    data = pickle.load(f)

whole = spacy_nlp(data.content.str.cat(sep=' '))
sentences = [sent.text for sent in whole.doc.sents]

entity_pairs = []

for i in tqdm(sentences):
  entity_pairs.append(get_entities(i))

relations = [get_relation(i) for i in tqdm(sentences)]

source = [i[0] for i in entity_pairs]

target = [i[1] for i in entity_pairs]

kg_df = pd.DataFrame({'source': source, 'target': target, 'edge': relations})

from py2neo import Graph, Node, Relationship
tx = Graph(password="Techugo@1234")
for index, row in df.iterrows():
    tx.evaluate('''
      MATCH (a:Title {property:$title})
      MERGE (a)-[r:R_TYPE]->(b:Description {property:$description})
    ''', parameters = {'title': row['title'], 'description': row['description']})