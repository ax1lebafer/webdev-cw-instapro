import { USER_POSTS_PAGE } from '../routes.js';
import { renderHeaderComponent } from './header-component.js';
import { posts, getToken, goToPage } from '../index.js';
import { sanitize } from '../helpers.js';
import { like, disLike } from '../api.js';
import { formatDistanceToNow } from 'date-fns';
import { ru } from 'date-fns/locale';

export function renderPostsPageComponent({ appEl }) {
  const postsHtml = posts
    .map((post, index) => {
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
            <div class="post-header" data-user-id="${post.user.id}">
                <img src="${post.user.imageUrl}" class="post-header__user-image">
                <p class="post-header__user-name">${sanitize(post.user.name)}</p>
            </div>
            <div class="post-image-container">
              <img class="post-image" src="${post.imageUrl}">
            </div>
            <div class="post-likes">
              <button data-post-id="${index}" class="like-button">
                <img style="${post.isLiked === false ? 'display: block' : 'display: none'}" src="./assets/images/like-not-active.svg">
                <img style="${post.isLiked === true ? 'display: block' : 'display: none'}" src="./assets/images/like-active.svg">
              </button>
              <p class="post-likes-text">
                ${likersRenderApp('')}
              </p>
            </div>
            <p class="post-text">
              <span class="user-name">${sanitize(post.user.name)}</span>
              ${sanitize(post.description)}
            </p>
            <p class="post-date">
              ${createdTimeToNow} назад
            </p>
          </li>
          <br>
        </ul>`;
    })
    .join('');

  appEl.innerHTML = `
    <div class="page-container">
      <div class="header-container"></div>
      ${postsHtml}
    </div>`;

  renderHeaderComponent({
    element: document.querySelector('.header-container'),
  });

  const likeButtons = document.querySelectorAll('.like-button');

  for (const likeButton of likeButtons) {
    likeButton.addEventListener('click', () => {
      if (getToken() === undefined) {
        alert('Ставить лайки могут только авторизованные пользователи');
        return (likeButton.disabled = true);
      } else {
        likeButton.disabled = false;
      }

      const index = likeButton.dataset.postId;

      if (posts[index].isLiked === false) {
        posts[index].likes.length += 1;
        posts[index].isLiked = !posts[index].isLiked;
        like({ posts, getToken, index }).then((data) => {
          posts[index].likes = data.post.likes;
          return renderPostsPageComponent({ appEl });
        });
      } else {
        posts[index].likes.length += -1;
        posts[index].isLiked = !posts[index].isLiked;
        disLike({ posts, getToken, index }).then((data) => {
          posts[index].likes = data.post.likes;
          return renderPostsPageComponent({ appEl });
        });
      }
    });
  }

  for (let userEl of document.querySelectorAll('.post-header')) {
    userEl.disabled = false;
    userEl.addEventListener('click', () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}
