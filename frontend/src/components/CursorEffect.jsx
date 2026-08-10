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
          className="fixed pointer-events-none rounded-full z-[9999]"
          style={{
            left: ripple.x,
            top: ripple.y,
            transform: 'translate(-50%, -50%)',
            border: '2px solid rgba(0, 0, 0, 1)',
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            animation: 'ripple-effect 0.5s ease-out forwards',
          }}
          onAnimationEnd={() => handleAnimationEnd(ripple.id)}
        />
      ))}
    </>
  );
};

export default CursorEffect;
