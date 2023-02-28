function viewSwap(newView) {
  if (data.view !== newView) {
    var $newView = document.querySelector('[data-view="' + newView + '"]');
    var $oldView = document.querySelector('[data-view="' + data.view + '"]');
    $newView.classList.remove('hidden');
    $oldView.classList.add('hidden');
    data.view = newView;
  }
}

var $hamburgerButton = document.querySelector('#hamburger');

$hamburgerButton.addEventListener('click', function () {
  if ($hamburger.classList.contains('hidden')) {
    $hamburger.classList.remove('hidden');
  } else {
    $hamburger.classList.add('hidden');
  }
});

var $hamburger = document.querySelector('#hamburger-open');

$hamburger.addEventListener('click', function () {
  if (event.target.closest('li')) {
    var $targetLi = event.target.closest('li');
    var newView = $targetLi.getAttribute('data-view-change');
    viewSwap(newView);
    $hamburger.classList.add('hidden');
  }
});

var $searchButton = document.querySelector('#search-home');
var $searchAgain = document.querySelector('#search-again');

function search(input) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.pokemontcg.io/v2/cards?q=name:' + input + '*');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    // console.log('status', xhr.status);
    // console.log('response:', xhr.response);
  });
  xhr.send();
}

$searchButton.addEventListener('click', function () {
  var $searchInput = $searchButton.previousElementSibling;
  if ($searchInput.value !== '') {
    search($searchInput.value);
  } else {
    search($searchInput.getAttribute('placeholder'));
  }
  viewSwap('search-results');
});

$searchAgain.addEventListener('click', function () {
  var $searchInput = $searchAgain.previousElementSibling;
  if ($searchInput.value !== '') {
    search($searchInput.value);
  }
});
