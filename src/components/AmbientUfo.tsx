const AmbientUfo = () => {
  return (
    <div className="ambient-ufo" aria-hidden>
      <div className="ambient-ufo__orbit">
        <div className="ambient-ufo__craft">
          <div className="ambient-ufo__dome" />
          <div className="ambient-ufo__body">
            <span />
            <span />
            <span />
          </div>
        </div>
        <div className="ambient-ufo__beam" />
        <div className="ambient-ufo__signal ambient-ufo__signal--a" />
        <div className="ambient-ufo__signal ambient-ufo__signal--b" />
      </div>
    </div>
  );
};

export default AmbientUfo;
