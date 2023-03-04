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
var selectedDeck = 0;
var deckToRender = 0;
var $deckPage = document.querySelector('[data-view="decks"]');

// Load and View Swapping

document.addEventListener('DOMContentLoaded', function () {
  if (data.collection.length > 1) {
    viewSwap('collection');
  } else {
    viewSwap('home');
  }
});

getTypes();
for (var i = 0; i < data.decks.length; i++) {
  renameDeck(true, '', i);
}

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

$searchPage.addEventListener('click', collectCard);

function collectCard(event) {
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
}

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

$collectionPage.addEventListener('click', function () {
  if (event.target.matches('[name="deck-add"] input') || event.target.matches('[name="deck-add"] label')) {
    var $deckSelect = event.target.closest('div').firstElementChild;
    if (Number($deckSelect.value) !== selectedDeck) {
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
    var $deckWarning = document.createElement('p');
    $deckWarning.setAttribute('id', 'deck-full');
    $deckWarning.textContent = 'FULL';
    var $warningDiv = $fullDeck.closest('div');
    $warningDiv.appendChild($deckWarning);
    setTimeout(removeWarning, 5000);
  } else {
    for (var i = 0; i < data.collection.length; i++) {
      if (cardID === data.collection[i].id) {
        data.decks[selectedDeck].collection.push(data.collection[i]);
        data.decks[selectedDeck].size++;
        deckSizeCheck(selectedDeck);
      }
    }
  }
}

function removeWarning() {
  var $warning = document.querySelector('#deck-full');
  $warning.remove();
}

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
    var $renameDeck = document.querySelector('#rename-deck');
    $renameDeck.classList.remove('hidden');
  }
  if (event.target.matches('.clear-deck')) {
    var $clearDeck = document.querySelector('#clear-deck');
    $clearDeck.classList.remove('hidden');
  }
  if (event.target.matches('#rename-deck .confirm')) {
    var $newName = document.querySelector('#new-name');
    if ($newName.value.trim() !== '') {
      renameDeck(false, $newName.value);
      var $closeModal = event.target.closest('.modal').parentElement;
      $closeModal.classList.add('hidden');
      $newName.value = '';
    }
  }
  if (event.target.matches('#clear-deck .confirm')) {
    data.decks[deckToRender].size = 0;
    data.decks[deckToRender].collection = [];
    deckSizeCheck(deckToRender);
    renderDeck(deckToRender);
    $closeModal = event.target.closest('.modal').parentElement;
    $closeModal.classList.add('hidden');
  }
  if (event.target.matches('.cancel')) {
    $closeModal = event.target.closest('.modal').parentElement;
    $closeModal.classList.add('hidden');
  }
  if (event.target.matches('#mobile-decks input') || event.target.matches('#mobile-decks label')) {
    var $deckSelect = event.target.closest('div').firstElementChild;
    if (Number($deckSelect.value) !== deckToRender) {
      deckToRender = Number($deckSelect.value);
      var $oldDeck = document.querySelector('.deck-btn-selected');
      $oldDeck.classList.remove('deck-btn-selected');
      $oldDeck.classList.add('deck-btn');
      var $newDeck = document.querySelector('[data-deck="' + deckToRender + '"]');
      $newDeck.classList.add('deck-btn-selected');
      $newDeck.classList.remove('deck-btn');
      renderDeck(deckToRender);
      renameDeck(true, '', deckToRender);
    }
  }
  if (event.target.matches('.deck-btn')) {
    var targetData = event.target.getAttribute('data-deck');
    var $button = event.target;
    if (Number(targetData) !== deckToRender) {
      deckToRender = Number(targetData);
      $oldDeck = document.querySelector('.deck-btn-selected');
      $oldDeck.classList.remove('deck-btn-selected');
      $oldDeck.classList.add('deck-btn');
      $button.classList.remove('deck-btn');
      $button.classList.add('deck-btn-selected');
      var $radioSelect = document.querySelector('#deck-' + (deckToRender + 1));
      $radioSelect.checked = true;
      renderDeck(deckToRender);
      renameDeck(true, '', deckToRender);
    }
  }
  if (event.target.matches('.remove-card')) {
    var $cardWrapper = event.target.closest('.card-wrapper');
    var cardID = $cardWrapper.getAttribute('data-location');
    $cardWrapper.remove();
    removeSingleDeckCard(cardID);
  }
});

function renameDeck(isLoad, newName, deck) {
  var $deckHeader = document.querySelector('.deck-header p');
  if (!isLoad) {
    var $deckButton = document.querySelector('[data-deck="' + deckToRender + '"]');
    var $deckRadio = document.querySelector('#deck-' + (deckToRender + 1));
    var $deckCollectPage = document.querySelector('#deck-' + (deckToRender + 1) + '-col');
    data.decks[deckToRender].name = newName;
    $deckHeader.textContent = newName + ' ' + data.decks[deckToRender].size + '/60';
    $deckButton.textContent = newName + ' ' + data.decks[deckToRender].size + '/60';
    $deckRadio.nextElementSibling.textContent = newName;
    $deckCollectPage.nextElementSibling.textContent = newName;
  } else if (isLoad) {
    $deckButton = document.querySelector('[data-deck="' + deck + '"]');
    $deckRadio = document.querySelector('#deck-' + (deck + 1));
    $deckCollectPage = document.querySelector('#deck-' + (deck + 1) + '-col');
    $deckHeader.textContent = data.decks[deckToRender].name + ' ' + data.decks[deckToRender].size + '/60';
    $deckButton.textContent = data.decks[deck].name + ' ' + data.decks[deck].size + '/60';
    $deckRadio.nextElementSibling.textContent = data.decks[deck].name;
    $deckCollectPage.nextElementSibling.textContent = data.decks[deck].name;
  }
}

function deckSizeCheck(deck) {
  var $deckButton = document.querySelector('[data-deck="' + deck + '"]');
  var $deckHeader = document.querySelector('.deck-header p');
  $deckHeader.textContent = data.decks[deckToRender].name + ' ' + data.decks[deck].size + '/60';
  $deckButton.textContent = data.decks[deck].name + ' ' + data.decks[deck].size + '/60';
}

function removeSingleDeckCard(cardID) {
  var removeIndex = data.decks[deckToRender].collection.indexOf(cardID);
  data.decks[deckToRender].collection.splice(removeIndex, 1);
  data.decks[deckToRender].size--;
  deckSizeCheck(deckToRender);
}

// Series and Sets

var series = [];
var setObject = [];
function retrieveSets() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.pokemontcg.io/v2/sets');
  xhr.responseType = 'json';
  xhr.addEventListener('load', function () {
    setObject = xhr.response.data;
    for (var i = 0; i < xhr.response.data.length; i++) {
      if (!series.includes(xhr.response.data[i].series)) {
        series.push(xhr.response.data[i].series);
      }
    }
    buildSeriesMenu();
  });
  xhr.send();
}
var $seriesMenu = document.querySelector('#series');
function buildSeriesMenu() {
  for (var i = 0; i < series.length; i++) {
    var $seriesOption = document.createElement('option');
    $seriesOption.textContent = series[i];
    $seriesOption.setAttribute('value', series[i]);
    $seriesMenu.appendChild($seriesOption);
  }
}

retrieveSets();
var $seriesPage = document.querySelector('[data-view="series"]');
$seriesMenu.addEventListener('change', function () {
  var $seriesRow = document.querySelector('.series');
  $seriesRow.remove();
  var $newSeriesRow = document.createElement('div');
  $newSeriesRow.classList.add('row');
  $newSeriesRow.classList.add('series');
  for (var i = 0; i < setObject.length; i++) {
    if (event.target.value === setObject[i].series) {
      var $logoWrapper = document.createElement('div');
      $logoWrapper.classList.add('column-half');
      $logoWrapper.classList.add('logo-wrapper');
      var $logoButton = document.createElement('button');
      $logoButton.classList.add('logo-button');
      var $logoImage = document.createElement('img');
      $logoImage.setAttribute('src', setObject[i].images.logo);
      $logoImage.setAttribute('data-set', setObject[i].id);
      $logoButton.appendChild($logoImage);
      $logoWrapper.appendChild($logoButton);
      var $setName = document.createElement('p');
      $setName.textContent = setObject[i].name;
      $setName.classList.add('set-name');
      $logoWrapper.appendChild($setName);
      $newSeriesRow.appendChild($logoWrapper);
    }
  }
  $seriesPage.appendChild($newSeriesRow);
});

// $seriesPage.addEventListener('click', function () {
//   if (event.target.matches('.logo-button img')) {
//     viewSwap('sets');
//     var $oldSetRow = document.querySelector('.sets');
//     $oldSetRow.remove();
//     currentSet = event.target.getAttribute('data-set');
//     renderSetcards(currentSet);
//   }
// });
// var count = 0;
// var currentSet = '';
// var $setsPage = document.querySelector('[data-view="sets"]');
// function renderSetcards() {
//   var xhr = new XMLHttpRequest();
//   xhr.open('GET', 'https://api.pokemontcg.io/v2/cards?q=set.id:' + currentSet);
//   xhr.responseType = 'json';
//   xhr.addEventListener('load', function () {
//     if (xhr.status >= 200 && xhr.status < 300) {
//       count = 0;
//       tempData = xhr.response;
//       var $setRow = document.createElement('div');
//       $setRow.classList.add('row');
//       $setRow.classList.add('sets');
//       $setsPage.appendChild($setRow);
//       renderTitle();
//       $setsPage = document.querySelector('.sets');
//       for (var i = 0; i < xhr.response.data.length; i++) {
//         console.log('rendering');
//         $setRow.appendChild(renderCard(xhr.response.data[i].images.small, xhr.response.data[i].id));
//       }
//       console.log('finished rendering cards');
//       // $setsPage.appendChild($setRow);
//     }
//   });
//   xhr.send();
// }

// function renderTitle() {
//   var $setHeaderImage = document.querySelector('#set-logo img');
//   var $setCounter = document.querySelector('#set-title');
//   var $setTitle = document.querySelector('#set-logo p');
//   for (var j = 0; j < setObject.length; j++) {
//     console.log('making title');
//     if (setObject[j].id === currentSet) {
//       $setHeaderImage.setAttribute('src', setObject[j].images.logo);
//       $setTitle.textContent = setObject[j].name;
//       $setCounter.textContent = count + '/' + setObject[j].printedTotal;
//     }
//   }
//   console.log('render title finished');
// }
// for (var k = 0; k < data.collection.length; k++) {
//   if (data.collection[k].id === xhr.response.data[i].id) {
//     count++;
//   }
// }

// $setsPage.addEventListener('click', collectCard);
// var page = 1;
// var totalPages = 1;
// function renderSetcards() {
//   var xhr = new XMLHttpRequest();
//   xhr.open('GET', 'https://api.pokemontcg.io/v2/cards?q=set.id:' + currentSet + '&page=' + page + '&pageSize=50');
//   xhr.responseType = 'json';
//   xhr.addEventListener('load', function () {
//     if (xhr.status >= 200 && xhr.status < 300) {
//       console.log('response', xhr.response);
//       totalPages += Math.floor(xhr.response.totalCount / xhr.response.pageSize);
//     }
//   });
//   xhr.send();
// }

// find total pages, then recursively load them!
