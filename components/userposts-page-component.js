import { sanitize } from '../helpers';
import { renderHeaderComponent } from './header-component.js';
import { posts, getToken } from '../index.js';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';
import { like, disLike } from '../api.js';

export function renderUserPostsPageComponent({ appEl }) {
  const appHtml = posts.map((post, index) => {
    const likesCounter = post.likes.length;
    let firstLiker = null;
    const moreLikers = String(' еще ' + (post.likes.length - 1));

    function likersRenderApp() {
      if (likesCounter === 0) {
        return '';
      }

      if (likesCounter === 1) {
        firstLiker = post.likes[0].name;
        return `Нравится: <span><strong>${firstLiker}</strong></span>`;
      }

      if (likesCounter > 1) {
        firstLiker = post.likes[0].name;
        return `Нравится: <span><strong>${firstLiker}</strong></span> и <span></span><span><strong>${moreLikers}</strong></span>`;
      }
    }

    const createdTimeToNow = formatDistanceToNow(new Date(post.createdAt), {
      locale: ru,
    });

    return `
        <ul class="posts">     
            <li class="post">
                <div class="post-image-container">
                    <img class="post-image" src="${post.imageUrl}">
                </div>
                <div class="post-likes">
                    <button data-post-id="${index}" class="like-button">
                        <img style="${post.isLiked === false ? 'display: block' : 'display: none'}" src="./assets/images/like-not-active.svg">
                        <img style="${post.isLiked === true ? 'display: block' : 'display: none'}" src="./assets/images/like-active.svg">
                    </button>
                    <p class="post-likes-text">${likersRenderApp()}</p>
                </div>
                <p class="post-text">
                    <span class="user-name">${sanitize(post.user.name)}</span>
                    ${sanitize(post.description)}
                </p>
                <p class="post-date">${createdTimeToNow}</p>
            </li>
            <br>
        </ul>`;
  });

  appEl.innerHTML = `
        <div class="page-container">
            <div class="header-container"></div>
            <div class="posts-user-header">
                <img src="${posts[0].user.imageUrl}" class="posts-user-header__user-image">
                <p class="posts-user-header__user-name">${posts[0].user.name}</p>
            </div>
            ${appHtml}
        </div>`;

  renderHeaderComponent({
    element: document.querySelector('.header-container'),
  });

  const likeButtons = document.querySelectorAll('.like-button');

  for (let likeButton of likeButtons) {
    likeButton.addEventListener('click', () => {
      if (getToken() === undefined) {
        return (likeButton.disabled = true);
      } else {
        likeButton.disabled = false;
      }
      const index = likeButton.dataset.postId;

      if (posts[index].isLiked === false) {
        posts[index].likes.length += 1;
        posts[index].isLiked = !posts[index].isLiked;
        like({ posts, getToken, index }).then(() => {
          return renderUserPostsPageComponent({ appEl });
        });
      } else {
        posts[index].likes.length += -1;
        posts[index].isLiked = !posts[index].isLiked;
        disLike({ posts, getToken, index }).then(() => {
          return renderUserPostsPageComponent({ appEl });
        });
      }
    });
  }
}
