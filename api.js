import { getToken } from './index.js';

const personalKey = 'ax1lebafer';
const baseHost = 'https://webdev-hw-api.vercel.app';
const postsHost = `${baseHost}/api/v1/${personalKey}/instapro`;

export function getPosts({ token }) {
  return fetch(postsHost, {
    method: 'GET',
    headers: {
      Authorization: token,
    },
  })
    .then((response) => {
      if (response.status === 401) {
        throw new Error('Нет авторизации');
      }

      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function getUserPosts({ data }) {
  return fetch(postsHost + `/user-posts/${data.userId}`, {
    method: 'GET',
    headers: {
      Authorization: getToken(),
    },
  })
    .then((response) => {
      return response.json();
    })
    .then((data) => {
      return data.posts;
    });
}

export function like({ posts, index }) {
  return fetch(postsHost + `/${posts[index].id}/like`, {
    method: 'POST',
    body: JSON.stringify({
      likes: { id: posts[index].user.id, name: posts[index].user.name },
      isLiked: posts.isLiked,
    }),
    headers: {
      Authorization: getToken(),
    },
  }).then((response) => {
    return response.json();
  });
}

export function disLike({ posts, index }) {
  return fetch(postsHost + `/${posts[index].id}/dislike`, {
    method: 'POST',
    body: JSON.stringify({
      likes: { id: posts[index].user.id, name: posts[index].user.name },
      isLiked: posts.isLiked,
    }),
    headers: {
      Authorization: getToken(),
    },
  }).then((response) => {
    return response.json();
  });
}

export function addPost({ description, imageUrl }) {
  console.log(description, imageUrl);
  return fetch(postsHost, {
    method: 'POST',
    body: JSON.stringify({
      description,
      imageUrl,
    }),
    headers: {
      Authorization: getToken(),
    },
  });
}

export function registerUser({ login, password, name, imageUrl }) {
  return fetch(baseHost + '/api/user', {
    method: 'POST',
    body: JSON.stringify({
      login,
      password,
      name,
      imageUrl,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error('Такой пользователь уже существует');
    }
    return response.json();
  });
}

export function loginUser({ login, password }) {
  return fetch(baseHost + '/api/user/login', {
    method: 'POST',
    body: JSON.stringify({
      login,
      password,
    }),
  }).then((response) => {
    if (response.status === 400) {
      throw new Error('Неверный логин или пароль');
    }
    return response.json();
  });
}

// Загружает картинку в облако, возвращает url загруженной картинки
export function uploadImage({ file }) {
  const data = new FormData();
  data.append('file', file);

  return fetch(baseHost + '/api/upload/image', {
    method: 'POST',
    body: data,
  }).then((response) => {
    return response.json();
  });
}
