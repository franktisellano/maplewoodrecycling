import React from 'react';

function Guidelines() {
    return (
        <>
            <div className="guidelines-grid">
                {/* Fiber Week */}
                <div className="guideline-card fiber">
                    <h2 className="guideline-title">
                        FIBER WEEK:<br />Cardboard & Paper
                    </h2>

                    <div className="check-icon">✅</div>
                    <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>YES! Please Recycle:</h3>

                    <ul className="guideline-list">
                        <li>Corrugated Cardboard (Flattened, no packing materials)</li>
                        <li>Boxboard (Flattened cereal boxes, etc)</li>
                        <li>Paper Bags</li>
                        <li>Junk Mail (Including window envelopes)</li>
                        <li>Office Paper</li>
                        <li>Newspapers & Magazines</li>
                        <li>Only Corrugated Brown Pizza Boxes (No grease, food & liner removed)</li>
                    </ul>
                </div>

                {/* Commingled Week */}
                <div className="guideline-card commingled">
                    <h2 className="guideline-title">
                        COMMINGLED WEEK:<br />Glass, Metal & Plastic
                    </h2>

                    <div className="check-icon">✅</div>
                    <h3 style={{ textAlign: 'center', marginBottom: '15px' }}>YES! Please Recycle:</h3>

                    <ul className="guideline-list">
                        <li>#1, 2, & 5 Plastic Containers & Bottles with Caps</li>
                        <li>Glass Bottles (Any Color) & Jars with Lids</li>
                        <li>Aluminum cans, pie tins, & catering trays</li>
                        <li>Steel/tin Food Cans</li>
                        <li>Gable Top cartons (OJ, Milk, aseptic packaging)</li>
                        <li>Juice Boxes (TetraPak)</li>
                    </ul>
                </div>
            </div>

            <div className="contaminants">
                <div style={{ textAlign: 'center' }}>
                    <div className="check-icon" style={{ color: '#d32f2f' }}>❌</div>
                    <h2>NO. These items contaminate the recycling.</h2>
                    <p style={{ fontWeight: 600, marginBottom: '10px' }}>IF IN DOUBT, THROW IT OUT.</p>
                    <p style={{ marginBottom: '20px', fontStyle: 'italic' }}>
                        Any materials not on the acceptable list (above) should not be recycled.
                    </p>
                </div>

                <div className="contaminants-list">
                    {/* Column 1 */}
                    <div>
                        <ul className="guideline-list" style={{ color: '#555' }}>
                            <li>Any materials with food or greasy residues</li>
                            <li>Pizza Boxes (other than clean corrugated brown)</li>
                            <li>Wax Cardboard (Produce protection)</li>
                            <li>Paper/cardboard egg cartons</li>
                            <li>Cardboard tubes and packaging padding</li>
                            <li>Plastics #3, 4, 6, & 7 and plastics without numbers</li>
                            <li>Plastic Bags & Plastic Film</li>
                            <li>Polystyrene Foam (Styrofoam)</li>
                            <li>Batteries, especially lithium</li>
                            <li>Aerosol Cans (Under Pressure)</li>
                        </ul>
                    </div>
                    {/* Column 2 */}
                    <div>
                        <ul className="guideline-list" style={{ color: '#555' }}>
                            <li>Aluminum foil</li>
                            <li>Electronics</li>
                            <li>Hoses</li>
                            <li>Ropes</li>
                            <li>Wires</li>
                            <li>Wood</li>
                            <li>Stickers</li>
                            <li>Corks</li>
                            <li>Clothing</li>
                            <li>Motor Oil Containers</li>
                            <li>Light Bulbs</li>
                            <li>Mirrors</li>
                            <li>Window Glass</li>
                            <li>Ceramic Plates</li>
                            <li>Cups & Mugs</li>
                            <li>Food Waste</li>
                            <li>Medical Waste</li>
                            <li>Hazardous Waste</li>
                        </ul>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Guidelines;
