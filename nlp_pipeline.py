
import spacy
# !python -m spacy download en_core_web_md
spacy_nlp = spacy.load('en_core_web_md')
from spacy import displacy
from spacy.lang.en.stop_words import STOP_WORDS
spacy.prefer_gpu()

import seaborn as sns
import pickle

with open('data-model/df.pkl', 'rb') as f:
    data = pickle.load(f)

whole = spacy_nlp(data.content.str.cat(sep=' '))
#POS tagging
labels = [spacy.explain(x.label_) for x in whole.ents]
items = [x.text for x in whole.ents]
words = [token.lemma_ for token in whole.doc if token.is_stop != True and token.is_punct != True]
sentences = [sent.text for sent in whole.doc.sents]

print(labels)

#dependency parsing
for chunk in whole.noun_chunks:
#    print(chunk.text, chunk.root.text, chunk.root.dep_, chunk.root.head.text)

#word vector representation
word_vector = whole.vector