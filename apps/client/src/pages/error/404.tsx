import React, { useEffect } from "react";
import { useNavigate } from "react-router";

/**
 * @packageDocumentation
 *
 * A fun 404 page that drifts into space with stars, a spinning planet,
 * and a bouncing “404” to entertain and guide the user back.
 */
const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();
  useEffect(() => {
    document.title = "404 - Page Not Found";
  }, []);

  return (
    <>
      <style>{`
        /* Star field background */
        .stars {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: 
            radial-gradient(2px 2px at 20% 20%, #fff, transparent),
            radial-gradient(2px 2px at 40% 40%, #fff, transparent),
            radial-gradient(2px 2px at 60% 60%, #fff, transparent),
            radial-gradient(2px 2px at 80% 80%, #fff, transparent);
          background-size: 100px 100px;
          animation: moveStars 60s linear infinite;
          z-index: 0;
        }

        @keyframes moveStars {
          to { background-position: -1000px 1000px; }
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>

      <div className="relative w-full h-screen bg-black overflow-hidden">
        <div className="stars" />

        <div
          role="main"
          aria-labelledby="not-found-title"
          className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4"
        >
          <h1
            id="not-found-title"
            className="text-9xl font-extrabold mb-4 animate-bounce"
          >
            404
          </h1>
          <h2 className="text-3xl mb-4">Not Found</h2>
          <p className="text-xl mb-8">
            Opa, parece que você se perdeu no espaço sideral!
          </p>
          <p className="text-lg mb-8">
            A página que você está procurando não existe.
          </p>
          <button
            onClick={() => navigate("/", { replace: true })}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded text-lg cursor-pointer transition duration-300 ease-in-out"
            aria-label="Go back to home page"
          >
            Me leve de volta para casa
          </button>
        </div>

        <div
          className="absolute bottom-10 right-10 w-32 h-32 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full opacity-75 animate-spin"
          style={{ animationDuration: "20s" }}
        />
      </div>
    </>
  );
};

export default NotFoundPage;
