var $collectionPage = document.querySelector('[data-view="collection"]');
var $hamburgerButton = document.querySelector('#hamburger');
var $hamburger = document.querySelector('#hamburger-open');
var $navLinks = document.querySelector('#nav-links');
var $searchButton = document.querySelector('#search-home');
var $searchAgain = document.querySelector('#search-again');
var $searchPage = document.querySelector('[data-view="search-results"]');
var tempData = {};

document.addEventListener('DOMContentLoaded', function () {
  data.view = 'home';
});

function viewSwap(newView) {
  if (data.view !== newView) {
    var $newView = document.querySelector('[data-view="' + newView + '"]');
    var $oldView = document.querySelector('[data-view="' + data.view + '"]');
    $newView.classList.remove('hidden');
    $oldView.classList.add('hidden');
    data.view = newView;
  }
  if (data.view === 'collection') {
    var $collection = document.querySelector('#collection');
    if (data.collection.length > $collection.childElementCount) {
      $collection.remove();
      var $newCollection = document.createElement('div');
      $newCollection.classList.add('row');
      $newCollection.setAttribute('id', 'collection');
      for (var i = 0; i < data.collection.length; i++) {
        $newCollection.appendChild(renderCard(data.collection[i].images.small, data.collection[i].id));
      }
      $collectionPage.appendChild($newCollection);
    }
  }
}

$hamburgerButton.addEventListener('click', function () {
  if ($hamburger.classList.contains('hidden')) {
    $hamburger.classList.remove('hidden');
  } else {
    $hamburger.classList.add('hidden');
  }
});

$hamburger.addEventListener('click', function () {
  if (event.target.closest('li')) {
    var $targetLi = event.target.closest('li');
    var newView = $targetLi.getAttribute('data-view-change');
    viewSwap(newView);
    $hamburger.classList.add('hidden');
  }
});

$navLinks.addEventListener('click', function () {
  if (event.target.closest('a')) {
    var $targetLink = event.target;
    var newView = $targetLink.getAttribute('data-view-change');
    viewSwap(newView);
    $hamburger.classList.add('hidden');
  }
});

function search(input) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.pokemontcg.io/v2/cards?q=name:' + input + '*');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    if (xhr.status >= 200 && xhr.status < 300) {
      tempData = xhr.response;
      var $cardRow = document.createElement('div');
      $cardRow.classList.add('row');
      for (var i = 0; i < xhr.response.data.length; i++) {
        $cardRow.appendChild(renderCard(xhr.response.data[i].images.small, xhr.response.data[i].id));
      }
      $searchPage.appendChild($cardRow);
    }
  });
  xhr.send();
}

function renderCard(imageUrl, cardID) {
  var $cardWrapper = document.createElement('div');
  $cardWrapper.classList.add('column-quarter');
  $cardWrapper.classList.add('card-wrapper');
  $cardWrapper.setAttribute('data-location', cardID);
  var $cardImage = document.createElement('img');
  $cardImage.setAttribute('src', imageUrl);
  $cardWrapper.appendChild($cardImage);
  if (data.view === 'search-results') {
    for (var i = 0; i < data.collection.length; i++) {
      if (data.collection[i].id === cardID) {
        var $checkMark = document.createElement('i');
        $checkMark.classList.add('fa-solid');
        $checkMark.classList.add('fa-square-check');
        $cardWrapper.appendChild($checkMark);
        return $cardWrapper;
      }
    }
    var $addButton = document.createElement('button');
    $addButton.classList.add('mobile-collect');
    var $addIcon = document.createElement('i');
    $addIcon.classList.add('fa-solid');
    $addIcon.classList.add('fa-circle-plus');
    $addButton.appendChild($addIcon);
    $cardWrapper.appendChild($addButton);
    var $collectButton = document.createElement('button');
    $collectButton.classList.add('desktop-collect');
    $collectButton.textContent = 'Collect';
    $cardWrapper.appendChild($collectButton);
    return $cardWrapper;
  }
  return $cardWrapper;
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

$searchPage.addEventListener('click', function () {
  if (event.target.matches('i') || event.target.matches('.desktop-collect')) {
    var $collectedCard = event.target.closest('.card-wrapper');
    var cardID = $collectedCard.getAttribute('data-location');
    for (var i = 0; i < tempData.data.length; i++) {
      if (cardID === tempData.data[i].id) {
        var newCard = {};
        newCard.id = tempData.data[i].id;
        newCard.name = tempData.data[i].name;
        newCard.supertype = tempData.data[i].supertype;
        newCard.hp = tempData.data[i].hp;
        newCard.types = tempData.data[i].types;
        newCard.images = tempData.data[i].images;
        newCard.set = tempData.data[i].set.id;
        newCard.setName = tempData.data[i].set.name;
        newCard.setSeries = tempData.data[i].set.series;
        data.collection.push(newCard);
      }
    }
    var $removeButtons = $collectedCard.children;
    $removeButtons.item(2).remove();
    $removeButtons.item(1).remove();
    var $checkMark = document.createElement('i');
    $checkMark.classList.add('fa-solid');
    $checkMark.classList.add('fa-square-check');
    $collectedCard.appendChild($checkMark);
  }
});
