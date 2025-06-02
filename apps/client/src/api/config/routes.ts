export const API_ROUTES = {
  /* ---------------------------------------------------------------- health */
  health: "/healthz",

  /* ----------------------------------------------------------- households */
  households: {
    base: "/households", // GET  list  | POST create
    byId: (id: string) => `/households/${id}`, // GET/PUT/DELETE one
    summary: (id: string) => `/households/summary/${id}`, // GET dashboard data
  },

  /* --------------------------------------------------------------- people */
  people: {
    base: "/people", // GET list | POST create
    byId: (id: string) => `/people/${id}`, // GET/PUT/DELETE one
    dashboard: "/people/dashboard", // GET weighted list
    deleteAndSettle: (id: string) => `/people/${id}?settle=true`,
  },

  /* ------------------------------------------------------------- expenses */
  expenses: {
    base: "/expenses", // GET list | POST create
    byId: (id: string) => `/expenses/${id}`, // GET/PUT/DELETE one
  },

  /* ----------------------------------------------------------- settlements */
  settlements: {
    base: "/settlements", // GET list | POST create
    byId: (id: string) => `/settlements/${id}`, // GET/DELETE one
  },
};

export default API_ROUTES;
