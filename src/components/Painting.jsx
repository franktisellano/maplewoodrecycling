import React from 'react';
import art from '../art/paint';

// Renders one of the watercolor SVGs from art/paint.js.
function Painting({ name, className }) {
    return <div className={className} dangerouslySetInnerHTML={{ __html: art[name] }} />;
}

export default Painting;
