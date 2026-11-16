import React from 'react';
import { paintingUrl } from '../art/urls';

// Renders one of the watercolors from art/paint.js, pre-rendered to an image (see tools/render-art.mjs).
function Painting({ name, className }) {
    return (
        <div className={`painting ${className}`}>
            <img src={paintingUrl(name)} alt="" decoding="async" draggable="false" />
        </div>
    );
}

export default Painting;
