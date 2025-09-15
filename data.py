# backend/data.py

MODULES_DATA = {
    'XII': {
        'Chemistry': [{'module': 'Solutions', 'summary': 'Study of solutions and their properties.', 'topics': ['Types of Solutions', 'Concentration', 'Solubility'], 'visualization': ['https://molview.org/?codid=1100025', 'https://www.chemtube3d.com/']}],
        'Biology': [{'module': 'Sexual Reproduction in Flowering Plants', 'summary': 'Reproduction in plants.', 'topics': ['Flower structure', 'Pollination', 'Double fertilization'], 'visualization': ['https://www.visiblebody.com/learn/biology']}],
        'Physics': [{'module': 'Electric Charges and Fields', 'summary': 'Basics of electric charge and field.', 'topics': ['Electric Charge', "Coulomb's Law", 'Electric Field'], 'visualization': ['https://phet.colorado.edu/']}]
    }
}

QUIZ_DATA = {
    'XII': {
        'Chemistry': {'Solutions': [{'q': 'What is a solution?', 'options': ['A homogeneous mixture', 'A compound', 'An element', 'A heterogeneous mixture'], 'answer': 'A homogeneous mixture'}]},
        'Biology': {'Sexual Reproduction in Flowering Plants': [{'q': 'What is double fertilization unique to?', 'options': ['Angiosperms', 'Gymnosperms', 'Fungi', 'Algae'], 'answer': 'Angiosperms'}]},
        'Physics': {'Electric Charges and Fields': [{'q': 'What is the SI unit of electric charge?', 'options': ['Volt', 'Ampere', 'Coulomb', 'Ohm'], 'answer': 'Coulomb'}]}
    }
}