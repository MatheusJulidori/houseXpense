import { Orbit } from "ldrs/react";

type SpinnerProps = {
  smallSize?: number;
  largeSize?: number;
  speed?: number;
};

function DefaultLoadingSpinner({
  smallSize = 35,
  largeSize = 50,
  speed = 1.5,
}: SpinnerProps) {

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex items-center justify-center"
    >
      <span className="sr-only">Carregando...</span>
      <div className="block 2xl:hidden">
        <Orbit size={smallSize} speed={speed} color="black" />
      </div>
      <div className="hidden 2xl:block">
        <Orbit size={largeSize} speed={speed} color="black" />
      </div>
    </div>
  );
}

export default DefaultLoadingSpinner;
