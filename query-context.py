import spacy
from spacy.matcher import Matcher
import pandas as pd

nlp = spacy.load('en_core_web_md')
matcher = Matcher(nlp.vocab)

doc = nlp("Digital transformation in retail banking")

token_texts = [token.text for token in doc]
pos_tags = [token.pos_ for token in doc]
entities=[(i, i.label_, i.label) for i in doc.ents]

for index, pos in enumerate(pos_tags):
    if pos == "PROPN":
        if pos_tags[index + 1] == "VERB":
            result = token_texts[index]
            print("Found proper noun before a verb:", result)     

pattern = [{"POS": "ADJ"}, {"POS": "NOUN"}, {"POS": "NOUN", "OP": "?"}]

matcher.add("ADJ_NOUN_PATTERN", None, pattern)
matches = matcher(doc)

for match_id, start, end in matches:
    print("Match found:", doc[start:end].text)  
