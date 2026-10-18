import React from 'react';
import { Link } from 'react-router-dom';
import PageHead from '../components/PageHead';
import Painting from '../components/Painting';

const FIBERS = [
    'Corrugated cardboard (flattened, no packing materials)',
    'Boxboard (flattened cereal boxes, etc.)',
    'Paper bags',
    'Junk mail (including window envelopes)',
    'Office paper',
    'Newspapers & magazines',
    'Corrugated brown pizza boxes only (no grease, food & liner removed)',
];

const COMMINGLED = [
    '#1, 2 & 5 plastic containers & bottles, with caps',
    'Glass bottles (any color) & jars, with lids',
    'Aluminum cans, pie tins & catering trays',
    'Steel/tin food cans',
    'Gable-top cartons (OJ, milk, aseptic packaging)',
    'Juice boxes (TetraPak)',
];

const KEEP_OUT = [
    'Anything with food or grease on it',
    'Pizza boxes (other than clean corrugated brown)',
    'Waxed cardboard (produce boxes)',
    'Paper/cardboard egg cartons',
    'Cardboard tubes and packaging padding',
    'Plastics #3, 4, 6 & 7, and plastics without numbers',
    'Plastic bags & plastic film',
    'Polystyrene foam (Styrofoam)',
    'Batteries, especially lithium',
    'Aerosol cans (under pressure)',
    'Aluminum foil',
    'Electronics',
    'Hoses, ropes & wires',
    'Wood',
    'Stickers',
    'Corks',
    'Clothing',
    'Motor oil containers',
    'Light bulbs',
    'Mirrors & window glass',
    'Ceramic plates, cups & mugs',
    'Food waste',
    'Medical waste',
    'Hazardous waste',
];

function Guidelines() {
    return (
        <>
            <PageHead eyebrow="What goes in the bin" title="Recycling guidelines">
                <p className="lede">
                    Pickups alternate: paper and cardboard one week, glass, metal and plastic the next.
                    The <Link to="/">schedule</Link> shows which week is which.
                </p>
            </PageHead>

            <div className="page wide">
                <div className="streams">
                    <section className="stream" aria-labelledby="fibers-title">
                        <Painting name="fibers" className="stream-art" />
                        <h2 id="fibers-title">Fiber week</h2>
                        <p className="where type-fibers">Paper & cardboard</p>
                        <ul className="yes-list">
                            {FIBERS.map(item => <li key={item}>{item}</li>)}
                        </ul>
                    </section>

                    <section className="stream" aria-labelledby="commingled-title">
                        <Painting name="commingled" className="stream-art" />
                        <h2 id="commingled-title">Commingled week</h2>
                        <p className="where type-commingled">Glass, metal & plastic</p>
                        <ul className="yes-list">
                            {COMMINGLED.map(item => <li key={item}>{item}</li>)}
                        </ul>
                    </section>
                </div>

                <Painting name="brush" className="brush-rule" />

                <section className="keep-out" aria-labelledby="keep-out-title">
                    <div className="keep-out-head">
                        <Painting name="trash" className="keep-out-art" />
                        <div>
                            <h2 className="section-title" id="keep-out-title">Keep these out</h2>
                            <p className="section-intro">
                                <strong>If in doubt, throw it out.</strong> Anything not on the lists above goes in the trash.
                                These items contaminate the recycling.
                            </p>
                        </div>
                    </div>
                    <ul className="no-list">
                        {KEEP_OUT.map(item => <li key={item}>{item}</li>)}
                    </ul>
                </section>
            </div>
        </>
    );
}

export default Guidelines;
