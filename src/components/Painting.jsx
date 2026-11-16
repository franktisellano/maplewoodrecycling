import React from 'react';
import { paintingUrl } from '../art/urls';

// Renders one of the watercolors from art/paint.js, as an image so its filters are drawn only once.
function Painting({ name, className }) {
    return (
        <div className={className}>
            <img src={paintingUrl(name)} alt="" decoding="async" draggable="false" />
        </div>
    );
}

export default Painting;
