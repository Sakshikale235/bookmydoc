// const container = document.querySelector('.container');
// const registerBtn = document.querySelector('.register-btn');
// const loginBtn = document.querySelector('.login-btn');

// registerBtn.addEventListener('click', () => {
//     container.classList.add('active');
// });

// loginBtn.addEventListener('click', () => {
//     container.classList.remove('active');
// });



// const registerBtn = document.querySelector('.register-btn');
// const loginBtn = document.querySelector('.login-btn');

// registerBtn.addEventListener('click', () => {
//     window.location.href = '/register';
// });

// loginBtn.addEventListener('click', () => {
//     window.location.href = '/login';
// });

const container = document.querySelector('.container');
const registerBtn = document.querySelector('.register-btn');
const loginBtn = document.querySelector('.login-btn');

registerBtn.addEventListener('click', () => {
    setTimeout(() => container.classList.add('active'), 100);
});

loginBtn.addEventListener('click', () => {
    setTimeout(() => container.classList.remove('active'), 100);
});
