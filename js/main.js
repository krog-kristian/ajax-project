var $collectionPage = document.querySelector('[data-view="collection"]');
var $hamburgerButton = document.querySelector('#hamburger');
var $hamburger = document.querySelector('#hamburger-open');
var $navLinks = document.querySelector('#nav-links');
var $searchButton = document.querySelector('#search-home');
var $searchAgain = document.querySelector('#search-again');
var $searchPage = document.querySelector('[data-view="search-results"]');
var tempData = {};
var $searchCollection = document.querySelector('div[data-tabs="search-collection"]');
var hpSorter = null;
var $hpButton = document.querySelector('#hp-sort');
var $multiSorter = document.querySelector('.multi-sorter');
var $select = document.querySelector('#filter-by');
var superTypes = [];
var types = [];

// Load and View Swapping

document.addEventListener('DOMContentLoaded', function () {
  if (data.collection.length > 1) {
    viewSwap('collection');
  } else {
    viewSwap('home');
  }
  getTypes();
});

function viewSwap(newView) {
  var $oldView = document.querySelector('[data-view="' + data.view + '"]');
  if (data.view !== newView) {
    var $newView = document.querySelector('[data-view="' + newView + '"]');
    $oldView.classList.add('hidden');
    $newView.classList.remove('hidden');
    data.view = newView;
  } else if ($oldView.classList.contains('hidden')) {
    $oldView.classList.remove('hidden');
  }
  if (data.view === 'collection') {
    var $collection = document.querySelector('#collection');
    if (data.collection.length !== $collection.childElementCount) {
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
  if (data.view === 'decks') {
    renderDeck(deckToRender);
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

// Search API and Render

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
  if (data.view === 'collection') {
    $addButton = document.createElement('button');
    $addButton.classList.add('mobile-collect');
    $addIcon = document.createElement('i');
    $addIcon.classList.add('fa-solid');
    $addIcon.classList.add('fa-circle-plus');
    $addButton.appendChild($addIcon);
    $cardWrapper.appendChild($addButton);
    var $addToDeck = document.createElement('button');
    $addToDeck.classList.add('desktop-collect');
    $addToDeck.textContent = 'Add to Deck';
    $cardWrapper.appendChild($addToDeck);
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
  $searchInput.value = '';
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
  $searchInput.value = '';
});

// Collect Card

$searchPage.addEventListener('click', function () {
  if (event.target.matches('i') || event.target.matches('.desktop-collect')) {
    var $collectedCard = event.target.closest('.card-wrapper');
    var cardID = $collectedCard.getAttribute('data-location');
    for (var i = 0; i < tempData.data.length; i++) {
      if (cardID === tempData.data[i].id) {
        var newCard = {};
        newCard.types = [];
        newCard.id = tempData.data[i].id;
        newCard.name = tempData.data[i].name;
        newCard.supertype = tempData.data[i].supertype;
        newCard.hp = Number(tempData.data[i].hp);
        newCard.types = tempData.data[i].types;
        newCard.images = tempData.data[i].images;
        newCard.set = tempData.data[i].set.id;
        newCard.setName = tempData.data[i].set.name;
        newCard.setSeries = tempData.data[i].set.series;
        data.collection.push(newCard);
        if (newCard.hp > data.highestHp) {
          data.highestHp = newCard.hp;
        }
        if (newCard.hp < data.lowestHp) {
          data.lowestHp = newCard.hp;
        }
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

// Sort and Filter

$multiSorter.addEventListener('click', function () {
  if (event.target.matches('.tab')) {
    var $oldTab = document.querySelector('.tab-active');
    $oldTab.setAttribute('class', 'tab');
    event.target.setAttribute('class', 'tab-active');
    var $tabs = document.querySelectorAll('.filter');
    var view = event.target.getAttribute('data-tabs');
    for (var i = 0; i < $tabs.length; i++) {
      if (view === $tabs[i].getAttribute('data-tabs')) {
        $tabs[i].classList.remove('hidden');
      } else {
        $tabs[i].classList.add('hidden');
      }
    }
  }
});

function getTypes() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.pokemontcg.io/v2/types');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    types = xhr.response.data;
    getSuperTypes();
  });
  xhr.send();
}

function getSuperTypes() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.pokemontcg.io/v2/supertypes');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    superTypes = xhr.response.data;
    renderOptions();
  });
  xhr.send();
}

function renderOptions() {
  var renderSelects = types.concat(superTypes);
  for (var i = 0; i < renderSelects.length; i++) {
    var $option = document.createElement('option');
    $option.textContent = renderSelects[i];
    $option.setAttribute('value', renderSelects[i]);
    $select.appendChild($option);
  }
}

$select.addEventListener('change', function () {
  var $collection = document.querySelector('#collection');
  $collection.remove();
  var $newCollection = document.createElement('div');
  $newCollection.classList.add('row');
  $newCollection.setAttribute('id', 'collection');
  for (var i = 0; i < data.collection.length; i++) {
    if (data.collection[i].supertype === event.target.value) {
      $newCollection.appendChild(renderCard(data.collection[i].images.small, data.collection[i].id));
    } else if (types.includes(event.target.value) && data.collection[i].supertype === 'Pokémon') {
      if (data.collection[i].types.includes(event.target.value)) {
        $newCollection.appendChild(renderCard(data.collection[i].images.small, data.collection[i].id));
      }
    } else if (event.target.value === '') {
      $newCollection.appendChild(renderCard(data.collection[i].images.small, data.collection[i].id));
    }
  }
  $collectionPage.appendChild($newCollection);
});

$hpButton.addEventListener('click', function () {
  var $arrowIcon = document.querySelector('#hp-sort > i');
  if (!hpSorter) {
    hpSorter = true;
    var $collection = document.querySelector('#collection');
    $collection.remove();
    var $newCollection = document.createElement('div');
    $newCollection.classList.add('row');
    $newCollection.setAttribute('id', 'collection');
    for (var i = (data.highestHp / 10); i >= (data.lowestHp / 10); i--) {
      for (var k = 0; k < data.collection.length; k++) {
        if ((data.collection[k].hp / 10) === i) {
          $newCollection.appendChild(renderCard(data.collection[k].images.small, data.collection[k].id));
        }
      }
      $arrowIcon.classList.remove('fa-arrows-up-down');
      $arrowIcon.classList.remove('fa-arrow-down-short-wide');
      $arrowIcon.classList.add('fa-arrow-up-wide-short');
    }
    $collectionPage.appendChild($newCollection);
  } else {
    hpSorter = false;
    $collection = document.querySelector('#collection');
    $collection.remove();
    $newCollection = document.createElement('div');
    $newCollection.classList.add('row');
    $newCollection.setAttribute('id', 'collection');
    for (var l = (data.lowestHp / 10); l <= (data.highestHp / 10); l++) {
      for (var j = 0; j < data.collection.length; j++) {
        if ((data.collection[j].hp / 10) === l) {
          $newCollection.appendChild(renderCard(data.collection[j].images.small, data.collection[j].id));
        }
      }
      $arrowIcon.classList.remove('fa-arrow-up-wide-short');
      $arrowIcon.classList.add('fa-arrow-down-short-wide');
    }
    $collectionPage.appendChild($newCollection);
  }
});

$searchCollection.addEventListener('input', searchAndRender);

function searchAndRender(event) {
  var cleanEvent = event.target.value.trim().replaceAll("'", '').toLowerCase();
  var $collection = document.querySelector('#collection');
  $collection.remove();
  var $newCollection = document.createElement('div');
  $newCollection.classList.add('row');
  $newCollection.setAttribute('id', 'collection');
  for (var i = 0; i < data.collection.length; i++) {
    if (data.collection[i].name.replaceAll("'", '').toLowerCase().includes(cleanEvent)) {
      $newCollection.appendChild(renderCard(data.collection[i].images.small, data.collection[i].id));
    }
  }
  $collectionPage.appendChild($newCollection);
}

// Decks
var selectedDeck = 0;
$collectionPage.addEventListener('click', function () {
  if (event.target.matches('[name="deck-add"] input') || event.target.matches('[name="deck-add"] label')) {
    var $deckSelect = event.target.closest('div').firstElementChild;
    if ($deckSelect.value !== selectedDeck) {
      selectedDeck = Number($deckSelect.value);
    }
  }
  if (event.target.matches('.mobile-collect > i') || event.target.matches('.desktop-collect')) {
    addToDeck(event.target.closest('.card-wrapper').getAttribute('data-location'));
  }
});

function addToDeck(cardID) {
  if (data.decks[selectedDeck].size === 60) {
    scroll(top);
    var $fullDeck = document.querySelector('#deck-' + (selectedDeck + 1) + '-col');
    $fullDeck.nextElementSibling.textContent = $fullDeck.nextElementSibling.textContent + '-DECK FULL-';
  } else {
    for (var i = 0; i < data.collection.length; i++) {
      if (cardID === data.collection[i].id) {
        data.decks[selectedDeck].collection.push(data.collection[i]);
        data.decks[selectedDeck].size++;
      }
    }
  }
}

var deckToRender = 0;
var $deckPage = document.querySelector('[data-view="decks"]');
function renderDeck(deckNumber) {
  var $deck = document.querySelector('#deck-cards');
  $deck.remove();
  var $newDeck = document.createElement('div');
  $newDeck.classList.add('row');
  $newDeck.setAttribute('id', 'deck-cards');
  for (var i = 0; i < data.decks[deckNumber].collection.length; i++) {
    var $removeButton = document.createElement('button');
    $removeButton.classList.add('remove-card');
    $removeButton.textContent = 'Remove';
    var $card = renderCard(data.decks[deckNumber].collection[i].images.small, data.decks[deckNumber].collection[i].id);
    $card.appendChild($removeButton);
    $newDeck.appendChild($card);
  }
  $deckPage.appendChild($newDeck);
}

$deckPage.addEventListener('click', function () {
  if (event.target.matches('.rename-deck') || event.target.matches('.rename-deck > i')) {
    // console.log('edit deck');
  }
  if (event.target.matches('.clear-deck')) {
    // console.log('clear deck');
  }
});

// function renameDeck() {

// }
