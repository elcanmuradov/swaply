import React from 'react';
import * as LucideIcons from 'lucide-react';
import { CATEGORIES } from '../../services/mockData';
import './CategoryBar.css';

const CategoryBar = () => {
    return (
        <div className="category-bar">
            <div className="container category-container">
                {CATEGORIES.map((cat) => {
                    const IconComponent = LucideIcons[cat.icon];
                    return (
                        <div key={cat.id} className="category-item">
                            <div className="category-icon-wrapper">
                                {IconComponent && <IconComponent size={24} />}
                            </div>
                            <span>{cat.name}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CategoryBar;
