import sys
# !{sys.executable} -m spacy download en
import re, numpy as np, pandas as pd
from pprint import pprint

# Gensim
import gensim, spacy, logging, warnings
import gensim.corpora as corpora
from gensim.utils import lemmatize, simple_preprocess
from gensim.models import CoherenceModel
import matplotlib.pyplot as plt

# NLTK Stop words
from nltk.corpus import stopwords
stop_words = stopwords.words('english')
stop_words.extend(['from', 'subject', 're', 'edu', 'use', 'not', 'would', 'say', 'could', '_', 'be', 'know', 'good', 'go', 'get', 'do', 'done', 'try', 'many', 'some', 'nice', 'thank', 'think', 'see', 'rather', 'easy', 'easily', 'lot', 'lack', 'make', 'want', 'seem', 'run', 'need', 'even', 'right', 'line', 'even', 'also', 'may', 'take', 'come'])

import pickle

def sent_to_words(sentences):
    for sent in sentences:
        sent = str(sent)
        sent = re.sub('\S*@\S*\s?', '', sent)  # remove emails
        sent = re.sub('\s+', ' ', sent)  # remove newline chars
        sent = re.sub("\'", "", sent)  # remove single quotes
        sent = gensim.utils.simple_preprocess(str(sent), deacc=True) 
        yield(sent)  

strr = """ Combining shared databases and cryptography, blockchain technology allows multiple parties that may not know each other from different geographical locations to have simultaneous access to a constantly updated digital ledger that cannot be altered. The blockchain is a powerful technology that enables Bitcoin, Litecoin, Dogecoin, and other virtual currencies to be open, anonymous, and secure. The blockchain essentially is a database about every Bitcoin transaction in detail. Usually known as a “public ledger,” the log contains metadata about when and how each transaction took place. The ledger is publicly accessible through APIs and torrent sites. To prevent tampering with current and also past transactions, the database is cryptographically secured. Because of Cryptography can edit only the parts of the blockchain that they “own” - by possessing the private keys required to write to the file. It also keeps everyone’s copy of the distributed blockchain is kept in sync. The blockchain could potentially save banks billions in cash by dramatically reducing processing costs. Banks are keen to take the opportunity to reduce transaction costs and the amount of paper that they process. Implementing blockchain would be a step to making banks increasingly profitable and valuable. All major banks are trying out blockchain which could be used for money transfers, record keeping and other back-end functions. The blockchain application changes the paper-intensive international trade finance process to an electronic decentralized ledger that gives all the participating entities, including banks, the ability to access a single source of information. It also allows them to track all documentation and validate ownership of assets digitally, as an un-alterable ledger in real time. Let’s look at how the financial and banking industry could benefit from blockchain.
Fraud Reduction
Blockchain is being recognized as the new technology that would reduce fraud in the financial world where 45% of financial intermediaries like stock exchanges and money transfer services are prone to financial crimes routinely. Most banking systems in the world, built on a centralized database, are more vulnerable to cyberattack because once hackers attack the one system they get full access. This technology would get rid of some of the current crimes committed online today against our financial institutions.
Know your Customer (KYC)
Financial institutions spend anywhere from $60 million up to $500 million per year to keep up with Know your Customer (KYC) and customer due diligence regulations according to a Thomson Reuters Survey. These regulations are meant to help reduce money laundering and terrorism activities by having requirements for businesses to verify and identify their clients. Blockchain would allow an organization to access the verification details of a client by another organization, thus avoiding repetition of the KYC process. The reduction in administrative costs for compliance departments would be significant.
Smart Contracts
Blockchains facilitate smart contracts as they facilitate storage of any kind of digital information, including computer code that can be executed once two or more parties enter their keys. Contracts could be created and financial transactions executed when this code is programmed, according to the set criteria.
Clearing and Settlement
The messy web that records loans and securities costs investment banks billions of dollars to run. Today, this is managed through a myriad of messages and manual reconciliation One of the best-known examples of this restructuring is the Australian Securities Exchange, which aims to transfer a lot of its post-trade clearing and settlement on to a blockchain system
Trade Finance
Trade finance is still mostly based on paper, such as bills of lading or letters of credit, being sent by fax or post around the world. Many think that blockchain is the obvious solution especially as numerous parties need access to the same information. This is a very important element of the supply chain, and blockchain can offer a vast amount of elements in this area. Mr. Ramachandran, head of innovation for commercial banking at HSBC, predicts that it will take five years to digitize the entire trade ecosystems, such as sugar or energy, but blockchain technology has the potential to be “genuinely game changing".
Syndicated Loans
When a US company raises money via a syndicated loan it takes an average of 19 days for the bank to settle the transaction. When a loan changes hands between banks or a borrower repays a loan early, much of the communication is still done by fax. He however indicates that, finding a way for separate blockchains to connect to each other in a way that changes to a loan's ownership is quickly reflected across all systems, is the core challenge. However, like trade finance, blockchain technology will not solve all the inefficiencies in the syndicated loan market alone, he says.
Payments
Blockchain disruption could be highly transformative in the payments process. It would allow banks higher security with minimal lower costs to process payment between organizations and their clients and even between banks themselves. Blockchain would get rid of all the intermediaries in the payment processing system.
Trading Platforms
With blockchain-based technology, there would momentous changes on our trading platforms with the risk of operational errors and fraud highly reduced. NASDAQ and the Australian Securities Exchange are some of the entities looking at blockchain solutions to cut costs and improve efficiencies.
 """
        
data = [strr]
data_words = list(sent_to_words(data))

# Build the bigram and trigram models
bigram = gensim.models.Phrases(data_words, min_count=5, threshold=100) # higher threshold fewer phrases.
trigram = gensim.models.Phrases(bigram[data_words], threshold=100)  
bigram_mod = gensim.models.phrases.Phraser(bigram)
trigram_mod = gensim.models.phrases.Phraser(trigram)

# !python3 -m spacy download en  # run in terminal once
def process_words(texts, stop_words=stop_words, allowed_postags=['NOUN', 'ADJ', 'VERB', 'ADV']):
    """Remove Stopwords, Form Bigrams, Trigrams and Lemmatization"""
    texts = [[word for word in simple_preprocess(str(doc)) if word not in stop_words] for doc in texts]
    texts = [bigram_mod[doc] for doc in texts]
    texts = [trigram_mod[bigram_mod[doc]] for doc in texts]
    texts_out = []
    nlp = spacy.load('en_core_web_md', disable=['parser', 'ner'])
    for sent in texts:
        doc = nlp(" ".join(sent)) 
        texts_out.append([token.lemma_ for token in doc if token.pos_ in allowed_postags])
    # remove stopwords once more after lemmatization
    texts_out = [[word for word in simple_preprocess(str(doc)) if word not in stop_words] for doc in texts_out]    
    return texts_out

data_ready = process_words(data_words)  # processed Text Data!

# Create Dictionary
id2word = corpora.Dictionary(data_ready)

# Create Corpus: Term Document Frequency
corpus = [id2word.doc2bow(text) for text in data_ready]

# Build LDA model
lda_model = gensim.models.ldamodel.LdaModel(corpus=corpus,
                                           id2word=id2word,
                                           num_topics=4, 
                                           random_state=100,
                                           update_every=1,
                                           chunksize=10,
                                           passes=10,
                                           alpha='symmetric',
                                           iterations=100,
                                           per_word_topics=True)

def format_topics_sentences(ldamodel=None, corpus=corpus, texts=data):
    for i, row_list in enumerate(ldamodel[corpus]):
        row = row_list[0] if ldamodel.per_word_topics else row_list
        row = sorted(row, key=lambda x: (x[1]), reverse=True)
        for j, (topic_num, prop_topic) in enumerate(row):
            if j == 0:
                wp = ldamodel.show_topic(topic_num)
                topic_keywords_words = [word for word, prop in wp]
                topic_keywords = ", ".join([topic_keywords_words[0], topic_keywords_words[1]])
            else:
                break
    
    return(topic_keywords)


df_topic_sents_keywords = format_topics_sentences(ldamodel=lda_model, corpus=corpus, texts=data_ready)
df_topic_sents_keywords