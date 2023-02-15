

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
# !python -m spacy download en_core_web_lg

# nlp = spacy.load('en_core_web_lg')

from spacy.lang.en import English
nlp = English()

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


txt = """powerful trends that have disrupted industries around the world are now affecting industrial distributors. A few are quickly building scale, making advances in commercial and operational excellence, and digitizing to create the seamless, omnichannel experiences that customers now demand. But we expect slower-moving distributors to struggle—and some to go the way of Blockbuster and Borders.

We also expect the disruption to accelerate. Fast-moving digital players eyeing the industry’s trillion-dollar revenue pools are offering best-in-class customer convenience and more price transparency. Sophisticated customers, armed with new data, are demanding deeper discounts and better promotions on more commoditized products. As manufacturers and customers gain leverage through consolidation, some are forging strong relationships that leave distributors in the cold.

These and other challenges come at a difficult time for the industry, whose returns have lagged those of the overall industrials sector for 15 years. Margins have remained narrow even in the recent economic recovery, and the pressure may rise. We expect many industrial distributors to lose strong customer relationships in the next few years and become mere links in supply chains, rather than business partners who add value.

But while the overall picture may look bleak, we see opportunities across sectors. A handful of leaders are growing share and margin. Based on our research and experience serving clients across industries, we believe that distributors who move quickly can create deeper customer relationships and sustainable competitive advantages to outperform consistently in the years ahead.

In this brief article, we review the industry’s major challenges and then outline the five strategies that we believe will help the winners outperform in the next decade.

The business is getting tougher
Based on our research, experience, and discussions with industry executives, we’ve identified a combination of market trends and internal challenges that threaten revenue growth and profitability in wholesale distribution.

Suppliers are aiming to build relationships directly with end customers
As manufacturers search for ways to increase margins, some are eyeing the profit pools of distributors. The rise of new digital technologies makes it easier than ever for manufacturers to pursue the idea at scale.

Some manufacturers are building their own distribution channels. For example, Bridgestone and Goodyear, two of the largest tire manufacturers, announced a joint distribution partnership in 2018. The new venture, TireHub, complements the companies’ networks of third-party distributors and provides a fully integrated distribution, warehousing, sales, and delivery solution, competing directly with traditional tire distributors.

Other manufacturers are selling directly to consumers on online platforms. For example, Dow Corning recaptured cost-sensitive customers by establishing Xiameter, a low-cost web-based brand. Within ten years of launch, online sales accounted for 40 percent of Dow Corning’s revenues. Kohler, a major manufacturer of plumbing products, has invested in direct-to-consumer and builders’ channels with a state-of-the-art e-commerce platform and supporting organization structure despite an extensive network of distributors and retailers who sell its products. The list goes on: prominent manufacturers across industries are looking for ways to capture a larger share of the overall value chain.

Disintermediation seems poised to accelerate. According to our 2018 survey of more than 100 senior manufacturing executives across the United States, manufacturers predict that the overall share of direct-to-customer sales will increase slightly in the coming years and that the share of products flowing via distributors and retailer channels will fall modestly.

According to a senior leader at a midsize HVAC manufacturer, “Direct dialogue with customers is a more harmonious sales model.” A department head at a midsize general industrial firm agreed. “We save money working directly with consumers,” he explained, “so we’d like to take care of distribution ourselves.”

These themes echo across segments (Exhibit 1). Manufacturers aiming for more direct end-customer sales say they are developing more end-customer relationships (40 percent of survey respondents), easing customer accessibility on the web (21 percent), and aiming to capture distributors’ margins (14 percent)."""

print(labelling(txt))    