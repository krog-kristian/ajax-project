/* exported data */

var data = {
  view: 'home',
  collection: [],
  highestHp: 0,
  lowestHp: 10
};

window.addEventListener('beforeunload', function (event) {
  var dataJSON = JSON.stringify(data);
  localStorage.setItem('tcg-tracker', dataJSON);
});

if (localStorage.getItem('tcg-tracker')) {
  var previousData = localStorage.getItem('tcg-tracker');
  data = JSON.parse(previousData);
}
