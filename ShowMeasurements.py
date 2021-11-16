import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import csv
import numpy as np

def displayTemps():
    plt.clf()

    x = []
    y = []

    with open('temps.csv','r') as csvfile:
        lines = csv.reader(csvfile, delimiter=',')
        for row in lines:
            x.append(row[0])
            y.append(float(row[1]))

    y_mean = [np.mean(y)] * len(x)

    plt.plot(x, y, color = 'b', linestyle = 'dashed', marker = 'o',label = "")
    # Plot the average line
    mean_line = plt.plot(x, y_mean, label='Snitt', linestyle='--')

    plt.xlabel('Nummer')
    plt.ylabel('Temperatur')
    plt.savefig('temps.png')

def displayPulse():
    plt.clf()

    x = []
    y = []

    with open('pulse.csv','r') as csvfile:
        lines = csv.reader(csvfile, delimiter=',')
        for row in lines:
            x.append(row[0])
            y.append(float(row[1]))

    y_mean = [np.mean(y)] * len(x)

    plt.plot(x, y, color = 'g', linestyle = 'dashed', marker = 'o',label = "")

    # Plot the average line
    mean_line = plt.plot(x, y_mean, label='Snitt', linestyle='--')

    plt.xlabel('Nummer')
    plt.ylabel('Puls')
    plt.savefig('pulse.png')

displayTemps()
displayPulse()
print('ferdig!')