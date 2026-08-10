import { useEffect, useState } from 'react';

const CursorEffect = () => {
  const [ripples, setRipples] = useState([]);

  useEffect(() => {
    const handleClick = (e) => {
      const newRipple = {
        id: Date.now(),
        x: e.clientX,
        y: e.clientY,
      };
      setRipples((prev) => [...prev, newRipple]);
    };

    window.addEventListener('click', handleClick);
    return () => window.removeEventListener('click', handleClick);
  }, []);

  const handleAnimationEnd = (id) => {
    setRipples((prev) => prev.filter((ripple) => ripple.id !== id));
  };

  return (
    <>
      {ripples.map((ripple) => (
        <div
          key={ripple.id}
          className="fixed pointer-events-none rounded-full border-2 border-indigo-500 bg-indigo-500/20 z-[9999]"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
            animation: 'ripple-effect 0.5s ease-out forwards',
          }}
          onAnimationEnd={() => handleAnimationEnd(ripple.id)}
        />
      ))}
    </>
  );
};

export default CursorEffect;
