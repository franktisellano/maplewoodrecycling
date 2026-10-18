import React from 'react';
import Painting from './Painting';

// A page heading on a wash of sky, with a line of trees underneath unless `scenery` is false.
function PageHead({ eyebrow, title, children, scenery = true }) {
    return (
        <div className="page-head">
            <Painting name="sky" className="hero-sky" />
            <div className="page-head-inner">
                {eyebrow && <p className="eyebrow">{eyebrow}</p>}
                <h1>{title}</h1>
                {children}
            </div>
            {scenery && <Painting name="treeline" className="treeline" />}
        </div>
    );
}

export default PageHead;
