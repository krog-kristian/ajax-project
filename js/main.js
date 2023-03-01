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

var $navLinks = document.querySelector('#nav-links');

$navLinks.addEventListener('click', function () {
  if (event.target.closest('a')) {
    var $targetLink = event.target;
    var newView = $targetLink.getAttribute('data-view-change');
    viewSwap(newView);
    $hamburger.classList.add('hidden');
  }
});

var $searchButton = document.querySelector('#search-home');
var $searchAgain = document.querySelector('#search-again');
var $searchPage = document.querySelector('[data-view="search-results"]');
// var tempData = {};

function search(input) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.pokemontcg.io/v2/cards?q=name:' + input + '*');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      // tempData = xhr.response;
      var $cardRow = document.createElement('div');
      $cardRow.classList.add('row');
      for (var i = 0; i < xhr.response.data.length; i++) {
        $cardRow.appendChild(renderCard(xhr.response.data[i].images.small, i));
      }
      $searchPage.appendChild($cardRow);
    }
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
  if ($searchPage.childElementCount > 1) {
    var firstChild = $searchPage.firstElementChild;
    firstChild.nextElementSibling.remove();
  }
});

$searchAgain.addEventListener('click', function () {
  var $searchInput = $searchAgain.previousElementSibling;
  if ($searchInput.value !== '') {
    search($searchInput.value);
  } else {
    search($searchInput.getAttribute('placeholder'));
  }
  if ($searchPage.childElementCount > 1) {
    var firstChild = $searchPage.firstElementChild;
    firstChild.nextElementSibling.remove();
  }
});

function renderCard(imageUrl, location) {
  var $cardWrapper = document.createElement('div');
  $cardWrapper.classList.add('column-quarter');
  $cardWrapper.classList.add('card-wrapper');
  $cardWrapper.setAttribute('data-location', location);
  var $cardImage = document.createElement('img');
  $cardImage.setAttribute('src', imageUrl);
  $cardWrapper.appendChild($cardImage);
  return $cardWrapper;
}
