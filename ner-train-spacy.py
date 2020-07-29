import spacy
import random
import csv
import plac
import argparse
import os
import pickle
import json
import logging
import sys

# Convert .tsv file to dataturks json format. 
def tsv_to_json_format(input_path,output_path,unknown_label):
    try:
        f=open(input_path,'r') # input file
        fp=open(output_path, 'w') # output file
        data_dict={}
        annotations =[]
        label_dict={}
        s=''
        start=0
        for line in f:
            lineList = line.split(',')
            if lineList[1]!='.':
                word = ""
                word = lineList[1]
                entity = lineList[len(lineList)-1]   
                s+=word+" "
                entity=entity[:len(entity)-1]
                if entity!=unknown_label:
                    if len(entity) != 1:
                        d={}
                        d['text']=word
                        d['start']=start
                        d['end']=start+len(word)-1  
                        try:
                            label_dict[entity].append(d)
                        except:
                            label_dict[entity]=[]
                            label_dict[entity].append(d) 
                start+=len(word)+1
            else:
                data_dict['content']=s
                s=''
                label_list=[]
                for ents in list(label_dict.keys()):
                    for i in range(len(label_dict[ents])):
                        if(label_dict[ents][i]['text']!=''):
                            l=[ents,label_dict[ents][i]]
                            for j in range(i+1,len(label_dict[ents])): 
                                if(label_dict[ents][i]['text']==label_dict[ents][j]['text']):  
                                    di={}
                                    di['start']=label_dict[ents][j]['start']
                                    di['end']=label_dict[ents][j]['end']
                                    di['text']=label_dict[ents][i]['text']
                                    l.append(di)
                                    label_dict[ents][j]['text']=''
                            label_list.append(l)                          
                            
                for entities in label_list:
                    label={}
                    label['label']=[entities[0]]
                    label['points']=entities[1:]
                    annotations.append(label)
                data_dict['annotation']=annotations
                annotations=[]
                json.dump(data_dict, fp)
                fp.write('\n')
                data_dict={}
                start=0
                label_dict={}
    except Exception as e:
        logging.exception("Unable to process file" + "\n" + "error = " + str(e))
        return None

# tsv_to_json_format("data-model/ner_dataset.csv",'data-model/ner_dataset.json','abc')

def convert_to_spacy_train_format(input_file=None, output_file=None):
    try:
        training_data = []
        lines=[]
        with open(input_file, 'r') as f:
            lines = f.readlines()

        for line in lines:
            data = json.loads(line)
            text = data['content']
            entities = []
            for annotation in data['annotation']:
                point = annotation['points'][0]
                labels = annotation['label']
                if not isinstance(labels, list):
                    labels = [labels]

                for label in labels:
                    entities.append((point['start'], point['end'] + 1 ,label))


            training_data.append((text, {"entities" : entities}))

        # print(training_data)

        with open(output_file, 'wb') as fp:
            pickle.dump(training_data, fp)

    except Exception as e:
        logging.exception("Unable to process " + input_file + "\n" + "error = " + str(e))
        return None

# convert_to_spacy_train_format('data-model/ner_dataset.json', "data-model/ner_dataset.pkl",)

pickle_in = open("data-model/ner_dataset.pkl","rb")
TRAIN_DATA = pickle.load(pickle_in)

def train_spacy(data,iterations):
    TRAIN_DATA = data
    nlp = spacy.blank('en') 

    if 'ner' not in nlp.pipe_names:
        ner = nlp.create_pipe('ner')
        nlp.add_pipe(ner, last=True)
       
    for _, annotations in TRAIN_DATA:
         for ent in annotations.get('entities'):
            ner.add_label(ent[2])

    other_pipes = [pipe for pipe in nlp.pipe_names if pipe != 'ner']
    with nlp.disable_pipes(*other_pipes): 
        optimizer = nlp.begin_training()
       
        for itn in range(iterations):
            print("Starting iteration " + str(itn))
            random.shuffle(TRAIN_DATA)
            losses = {}

            for text, annotations in TRAIN_DATA:
                try:
                    nlp.update(
                    [text],
                    [annotations], 
                    drop=0.2, 
                    sgd=optimizer, 
                    losses=losses)
                except:
                    except Exception as e:
                    logging.exception(str(e))
                    return None
            print(losses)
    return nlp

prdnlp = train_spacy(TRAIN_DATA, 20)

modelfile = input("Enter your Model Name: ")
prdnlp.to_disk(modelfile)

test_text = input("Enter your testing text: ")
doc = prdnlp(test_text)
for ent in doc.ents:
    print(ent.text, ent.start_char, ent.end_char, ent.label_)