import Layout from './Layout.jsx';
import Home from './pages/Home.jsx';
export const PAGES = { Home };
export const ADMINS = {};
export const PRIVATE_PAGES = {};
export const pagesConfig = {
  privatePages: PRIVATE_PAGES,
  mainPage: 'Home',
  Pages: PAGES,
  Layout: Layout,
  Admins: ADMINS,
  adminMainPage: '',
  AdminLayout: null,
};