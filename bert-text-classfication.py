import pandas as pd
import numpy as np
import re
# from sklearn.model_selection import train_test_split
# from bert_serving.client import BertClient
# from sklearn.linear_model import LogisticRegression
# from sklearn.metrics import accuracy_score

# load training data
train = pd.read_csv('data-model/cognizant.csv', encoding='iso-8859-1')
train.shape

print(train)
exit()


# text preprocessing
def clean_text(text):
    text = re.sub(r'[^a-zA-Z\']', ' ', text)
    text = re.sub(r'[^\x00-\x7F]+', '', text)
    text = text.lower()
       
    return text

train['clean_text'] = train.content.apply(clean_text)

# split into training and validation sets
X_tr, X_val, y_tr, y_val = train_test_split(train.clean_text, train.label, test_size=0.25, random_state=42)

bc = BertClient(ip="YOUR_SERVER_IP")

# get the embedding for train and val sets
X_tr_bert = bc.encode(X_tr.tolist())
X_val_bert = bc.encode(X_val.tolist())

# LR model
model_bert = LogisticRegression()
# train
model_bert = model_bert.fit(X_tr_bert, y_tr)
# predict
pred_bert = model_bert.predict(X_val_bert)

print(accuracy_score(y_val, pred_bert))