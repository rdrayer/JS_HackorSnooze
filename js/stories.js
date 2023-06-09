"use strict";

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
  storyList = await StoryList.getStories();
  $storiesLoadingMsg.remove();

  putStoriesOnPage();
}




/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story) {
  // console.debug("generateStoryMarkup", story);

  const hostName = story.getHostName();

  // is there a current user, if so, show star option
  const showStar = Boolean(currentUser);
  //console.log(showStar);

  return $(`
      <li id="${story.storyId}">
        ${showStar ? getStarHTML(story, currentUser) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

function getStarHTML(story, user) {
  const isFavorite = user.isFavorite(story);
  const starType = isFavorite ? "fas" : "far";
  return `
      <span class="star">
        <i class="${starType} fa-star"></i>
      </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
  console.debug("putStoriesOnPage");

  $allStoriesList.empty();

  // loop through all of our stories and generate HTML for them
  for (let story of storyList.stories) {
    const $story = generateStoryMarkup(story);
    $allStoriesList.append($story);
  }

  $allStoriesList.show();
  $favoriteStories.hide();
  $myStories.hide();

  // if(currentUser.favorites) {
  //   //console.log(currentUser.favorites);
  //   const lis = document.querySelectorAll('li');
  //   //console.log(lis);
  // }
}

async function addNewStory() {
  console.debug("addNewStory");
  
  // grab the values from the create story form
  const author = $("#create-author").val();
  const title = $("#create-title").val();
  const url = $("#create-url").val();
  // console.log(author + title + url);

  let newStory = await storyList.addStory(currentUser, { title: title, author: author, url: url });
  //console.log(newStory instanceof Story);

  // remove form and add new story to existing list
  $addStoryForm.hide();
  putStoriesOnPage();
}

$addStoryForm.on("submit", addNewStory);

async function toggleFavStory(evt) {
  console.debug("toggleFavStory");
  
  const $tgt = $(evt.target);
  // get closest li element
  const $closestLi = $tgt.closest('li');
  // get storyID from li id attribute
  const storyID = $closestLi.attr('id');
  //console.log(storyID);
  // get story object
  const story = storyList.stories.find(s => s.storyId === storyID);
  //console.log(story);

  if ($tgt.hasClass('fas')) {
    $tgt.closest('i').toggleClass('fas far');
    await currentUser.removeFavStory(story);
  } else {
    $tgt.closest('i').toggleClass('far fas');
    await currentUser.addFavStory(story);
  }
}

$storiesList.on('click', '.star', toggleFavStory);

function displayFavorites() {
  console.debug("displayFavorites");

  $favoriteStories.empty();

  for (let story of currentUser.favorites) {
    const $story = generateStoryMarkup(story);
    $favoriteStories.append($story);
  }
  $allStoriesList.hide();
  $myStories.hide();
  $addStoryForm.hide();
  $favoriteStories.show();
}

$navFavorites.on('click', displayFavorites);

function displayMyStories() {
  console.debug("displayMyStories") 

  $myStories.empty();

  for (let story of currentUser.ownStories) {
    const $story = generateStoryMarkup(story);
    $myStories.append($story);
  }
  $allStoriesList.hide();
  $favoriteStories.hide();
  $myStories.show();
}

$navMyStories.on('click', displayMyStories);

