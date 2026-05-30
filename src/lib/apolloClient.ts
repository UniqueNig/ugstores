import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";

const httpLink = new HttpLink({
  uri: "/api/graphql",
});

const getCookie = (name: string) => {
  if (typeof document === "undefined") return null;
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
};

const authLink = setContext((_, { headers }) => {
  const isAdminRoute =
    typeof window !== "undefined" &&
    window.location.pathname.startsWith("/admin");

  const token = isAdminRoute
    ? getCookie("admin_token") // admin pages → admin token only
    : getCookie("user_token"); // all other pages → user token only

  return {
    headers: {
      ...headers,
      authorization: token ? `Bearer ${token}` : "",
    },
  };
});

export const client = new ApolloClient({
  link: authLink.concat(httpLink),
  cache: new InMemoryCache({
    typePolicies: {
      Query: {
        fields: {
          products: {
            merge: false, // ← don't merge, always replace with fresh data
          },
        },
      },
    },
  }),
});
