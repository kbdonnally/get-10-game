# divs.py

# create matrix for game grid items
# grid-areas: r{0}c{1} => {0}{1}, changed 12/21/17
row = [1, 2, 3, 4, 5]
col = [1, 2, 3, 4, 5]
matrix = [["r{0}-c{1}".format(r, c), r, c] for r in row for c in col]
areanames = ["r{0}-c{1}".format(r, c) for r in row for c in col]
order = [o for o in range(15)]

# create divs for game HTML
def makeGameDivs(matrix):
	divList = ''
	for m in matrix:
		html = '''<div class="game-grid__item" style="grid-area:{0}" data-grid-row="{1}" data-grid-col="{2}"></div>\n'''.format(m[0], m[1], m[2])
		divList += html
	return divList

# print the strings for 'grid-template-areas'
def writeGridAreas(areanames):
	row1 = ''
	row2 = ''
	row3 = ''
	row4 = ''
	row5 = ''
	for i, a in enumerate(areanames):
		if i//5 == 0:
			row1 += a + ' '
		elif i//5 == 1:
			row2 += a + ' '
		elif i//5 == 2:
			row3 += a + ' '
		elif i//5 == 3:
			row4 += a + ' '
		elif i//5 == 4:
			row5 += a + ' '
		else:
			print("Error!")
	return '''"{0}"\n"{1}"\n"{2}"\n"{3}"\n"{4}"'''.format(row1, row2, row3, row4, row5)

# create HTML for flex version of game
def makeFlexDivs(order, col):
	html = ''
	for c in col:
		html += '''<div class="game-flex__col--{0}">\n'''.format(c)
		for i, o in enumerate(order):
			item = '''\t<div class="game-grid__item" style="order:{0}" data-grid-row="{0}" data-grid-col="{1}" data-position="r{0}-c{1}"></div>\n'''.format(o, c)
			html += item
		html += '</div>\n'
	return html

print(makeFlexDivs(order, col))