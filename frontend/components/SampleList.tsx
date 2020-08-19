import * as React from 'react';
import { useMemo } from 'react';
import { List, WindowScroller } from 'react-virtualized';

import { Sample } from '../api';
import { useTextMeasurer } from '../helpers/TextMeasurer';
import {
    detailFont,
    nameFont,
    sampleHeight,
    sampleMargin,
    samplePaddingX,
} from '../styles/sync-variables';
import SampleItem from './SampleItem';

interface SampleListProps {
    samples: Sample[];
}

function useSampleWidths(samples: Sample[]): number[] {
    const nameMeasurer = useTextMeasurer(nameFont);
    const detailMeasurer = useTextMeasurer(detailFont);

    function getWidth(sample: Sample): number {
        return (
            sampleMargin * 2 +
            samplePaddingX * 2 +
            Math.max(
                nameMeasurer.measureWidth(sample.name),
                detailMeasurer.measureWidth(sample.categories.join(' / ')),
            )
        );
    }

    return useMemo(() => samples.map(getWidth), [samples]);
}

function computeLayout(itemWidths: number[], maxRowWidth: number): number[][] {
    // TODO: Better layout computation. Perhaps do local search (with badness like LaTeX) after the current greedy approach.

    let rows = [[]];
    let rowWidth = 0;
    for (let i = 0; i < itemWidths.length; ++i) {
        if (rowWidth === 0 || rowWidth + itemWidths[i] < maxRowWidth) {
            rowWidth += itemWidths[i];
            rows[rows.length - 1].push(i);
        } else {
            rowWidth = itemWidths[i];
            rows.push([i]);
        }
    }
    return rows;
}

export default function SampleList({ samples }: SampleListProps) {
    const containerWidth = 1000;
    const rowHeight = sampleHeight + sampleMargin * 2;

    const widths = useSampleWidths(samples);
    // TODO: Use actual width as maxRowWidth
    const layout = computeLayout(widths, containerWidth);

    return (
        <WindowScroller>
            {({ height, isScrolling, onChildScroll, scrollTop }) => (
                <List
                    className="SampleList"
                    width={containerWidth}
                    height={height}
                    autoHeight
                    isScrolling={isScrolling}
                    onScroll={onChildScroll}
                    scrollTop={scrollTop}
                    rowHeight={rowHeight}
                    rowCount={layout.length}
                    rowRenderer={({ index: rowIndex, style }) => (
                        <div
                            key={rowIndex}
                            className="SampleList__row"
                            style={style}
                        >
                            {layout[rowIndex].map((index) => {
                                const sample = samples[index];
                                return (
                                    <SampleItem
                                        key={sample.key}
                                        sample={sample}
                                    />
                                );
                            })}
                            {rowIndex === layout.length - 1 && (
                                <div className="SampleList__pusher" />
                            )}
                        </div>
                    )}
                />
            )}
        </WindowScroller>
    );
}
