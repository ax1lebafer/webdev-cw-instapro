import { USER_POSTS_PAGE } from '../routes.js';
import { renderHeaderComponent } from './header-component.js';
import { posts, goToPage, user, page } from '../index.js';
import { sanitize } from '../helpers.js';
import { formatDistance } from 'date-fns';
import { ru } from 'date-fns/locale';

export function renderPostsPageComponent({ appEl }) {
  const postsHtml = posts
    .map((post) => {
      return `
        <li class="post">
        ${
          page != USER_POSTS_PAGE
            ? `<div class="post-header" data-user-id=${post.user.id}>
            <img src=${post.user.imageUrl} class="post-header__user-image">
            <p class="post-header__user-name">${sanitize(post.user.name)}</p>
          </div>`
            : ''
        }
          <div class="post-image-container">
            <img class="post-image" src=${post.imageUrl}>
          </div>
          <div class="post-likes">
            <button data-post-id=${post.id} data-post-liked="${
              post.isLiked
            }" class="like-button">

            ${
              post.isLiked
                ? `<img src="./assets/images/like-active.svg"></img>`
                : `<img src="./assets/images/like-not-active.svg"></img>`
            }

            </button>
            <p class="post-likes-text">
              Нравится: <strong>

              ${
                post.likes.length === 0
                  ? 0
                  : post.likes.length === 1
                    ? sanitize(post.likes[0].name)
                    : sanitize(post.likes[post.likes.length - 1].name) +
                      ' и ещё ' +
                      (post.likes.length - 1)
              }

              </strong>
            </p>
           </div>
           <div class="footer">
            <div>
              <p class="post-text">
                <span class="user-name">            
                ${sanitize(post.user.name)}
                </span>
                ${post.description}
              </p>
              <p class="post-date">
                ${formatDistance(new Date(), new Date(post.createdAt), {
                  locale: ru,
                })} назад
              </p>
            </div>  
            <div>
            ${
              user
                ? user._id === post.user.id
                  ? `<button data-id=${post.id} class="button">
                <div title="Удалить пост"></div>
                Удалить</button>`
                  : ''
                : ''
            }
            </div>
          </div>
        </li>`;
    })
    .join('');

  console.log(posts);

  let userPosts = posts.map((post) => post);

  let idUser = userPosts[0].user.id;
  let nameUser = userPosts[0].user.name;
  let imageUser = userPosts[0].user.imageUrl;

  const appHtml = `
    <div class="page-container">
      <div class="header-container"></div>
      <ul class="posts">
      <li class="post">
      ${
        page === USER_POSTS_PAGE
          ? `<div class="posts-user-header" data-user-id=${idUser}>
          <img src=${imageUser} class="posts-user-header__user-image">
          <p class="posts-user-header__user-name">${sanitize(nameUser)}</p>
        </div>`
          : ''
      }

        ${postsHtml}
        </li>
      </ul>
    </div>`;

  appEl.innerHTML = appHtml;

  /**
   * TODO: чтобы отформатировать дату создания поста в виде "19 минут назад"
   * можно использовать https://date-fns.org/v2.29.3/docs/formatDistanceToNow
   */

  renderHeaderComponent({
    element: document.querySelector('.header-container'),
  });

  for (let userEl of document.querySelectorAll('.post-header')) {
    userEl.addEventListener('click', () => {
      goToPage(USER_POSTS_PAGE, {
        userId: userEl.dataset.userId,
      });
    });
  }
}
