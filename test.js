import { USER_POSTS_PAGE } from '../routes.js';
import { renderHeaderComponent } from './header-component.js';
import { goToPage, page, id, user } from '../index.js';
import { likePost, delPost } from './toggle-del-posts-components.js';
import { sanitize } from '../helpers.js';
import { formatDistance } from 'date-fns';
// Require Russian locale
import { ru } from 'date-fns/locale';

// export function renderPostsPageComponent({ appEl }) {
export function renderPostsPageComponent({ appEl, posts }) {
  // TODO: реализовать рендер постов из api
  console.log('Актуальный список постов:', posts);

  let postsHTML = posts
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

        ${postsHTML}
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

  for (let like of document.querySelectorAll('.like-button')) {
    like.addEventListener('click', (event) => {
      event.stopPropagation();
      if (user) {
        let likeId = like.dataset.postId;
        let likeIsLiked = like.dataset.postLiked;
        let doLike = '';
        if (likeIsLiked === 'false') {
          doLike = 'like';
        } else {
          doLike = 'dislike';
        }
        likePost({ likeId, doLike, page, posts });
      } else {
        alert('Ставить лайки могут только авторизованные пользователи');
      }
    });
  }

  for (let del of document.querySelectorAll('.button')) {
    del.addEventListener('click', (event) => {
      event.stopPropagation();
      let delId = del.dataset.id;
      delPost({ delId, page, posts });
    });
  }

  return posts;
}

const btnUp = {
  el: document.querySelector('.btn-up'),
  show() {
    // удалим у кнопки класс btn-up_hide
    this.el.classList.remove('btn-up_hide');
  },
  hide() {
    // добавим к кнопке класс btn-up_hide
    this.el.classList.add('btn-up_hide');
  },
  addEventListener() {
    // при прокрутке содержимого страницы
    window.addEventListener('scroll', () => {
      // определяем величину прокрутки
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      // если страница прокручена больше чем на 400px, то делаем кнопку видимой, иначе скрываем
      scrollY > 400 ? this.show() : this.hide();
    });
    // при нажатии на кнопку .btn-up
    document.querySelector('.btn-up').onclick = () => {
      // переместим в начало страницы
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth',
      });
    };
  },
};

btnUp.addEventListener();
