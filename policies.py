import pandas as pd
import geocoder
from bokeh.plotting import figure, output_file, show
from bokeh.sampledata.us_states import data as states 
from bokeh.models import Range1d, TapTool
from bokeh.layouts import row, column
from bokeh.io import curdoc

policies = pd.read_csv("state_policy.csv")
votes = pd.read_csv("2016-election.csv", delimiter=';')
covid = pd.read_csv("COVID-19_Cases.csv")

ak = states['AK']
hi = states['HI']

#del states['HI']
#del states['AK']

state_xs = [states[code]["lons"] for code in states]
state_ys = [states[code]["lats"] for code in states]

state_name = [states[code]['name'] for code in states]
states_color=[]
for name in state_name:
	win = votes.loc[votes['State'] == name]['Winner']
	if win.item()  == 'Democratic':
		states_color.append('darkblue')
	else:
		states_color.append('red')

state_df = pd.DataFrame(data=state_name, columns=['name'])
tools = "pan,wheel_zoom,box_zoom,reset,tap"
p = figure(title="COVID-19 Policies", plot_width=1000, plot_height=700, x_range=Range1d(start=-180, end=-65), y_range=Range1d(start=17,end=73),tools = tools)
p.patches(state_xs, state_ys, fill_color=states_color, fill_alpha=0.6, line_color="black", line_width=2, line_alpha=0.5)
def callback(event):
	print(event)
	print('tapped')
taptool = p.select(type=TapTool)
p.on_event('tap',callback)
#show(p)
d = figure(plot_width=300, plot_height=400)
layout = row(p,d)
curdoc().add_root(layout)
