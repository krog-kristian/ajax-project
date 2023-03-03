/* exported data */

var data = {
  view: 'home',
  collection: [],
  highestHp: 0,
  lowestHp: 10,
  decks: [
    {
      name: 'Deck 1',
      collection: [],
      size: 0
    },
    {
      name: 'Deck 2',
      collection: [],
      size: 0
    },
    {
      name: 'Deck 3',
      collection: [],
      size: 0
    },
    {
      name: 'Deck 4',
      collection: [],
      size: 0
    }
  ]
};

window.addEventListener('beforeunload', function (event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('tcg-tracker', dataJSON);
});

if (localStorage.getItem('tcg-tracker')) {
  var previousData = localStorage.getItem('tcg-tracker');
  data = JSON.parse(previousData);
}
