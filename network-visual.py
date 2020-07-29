from numpy import genfromtxt
import numpy as np
mydata = genfromtxt('data-model/co-occurency-matrix.csv', delimiter=',')

adjacency = mydata[1:,1:]

import matplotlib.pyplot as plt
import networkx as nx

def show_graph_with_labels(adjacency_matrix):
    rows, cols = np.where(adjacency_matrix == 1)
    edges = zip(rows.tolist(), cols.tolist())
    gr = nx.Graph()
    gr.add_edges_from(edges)
    nx.draw(gr, node_size=500,  with_labels=True)
    plt.show()

show_graph_with_labels(adjacency)