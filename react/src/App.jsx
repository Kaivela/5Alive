import "./App.css";
import Home from "./Home";
import Room from "./Room";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

function roomLoader({ params }) {
  return { roomId: params.roomId };
}

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/room/:roomId",
    element: <Room />,
    loader: roomLoader,
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
