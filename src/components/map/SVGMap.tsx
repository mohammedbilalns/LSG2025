import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery } from '@tanstack/react-query';
import type { TrendResult } from '../../services/dataService'; // type-only import

interface SVGMapProps {
    url: string;
    trendData?: TrendResult;
    onWardClick?: (wardNo: string) => void;
    onError?: () => void;
}

const fetchSVG = async (url: string) => {
    const response = await fetch(url);
    if (!response.ok) throw new Error('Failed to fetch SVG');
    return await response.text();
};

export const SVGMap: React.FC<SVGMapProps> = ({ url, trendData, onWardClick, onError }) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [tooltip, setTooltip] = useState<{ x: number; y: number; content: React.ReactNode } | null>(null);

    const { data: svgContent, isLoading, error } = useQuery({
        queryKey: ['svg-map', url],
        queryFn: () => fetchSVG(url),
        enabled: !!url,
        staleTime: Infinity, // SVGs are static
        retry: false, // Don't retry if 404
    });

    useEffect(() => {
        if (error && onError) {
            onError();
        }
    }, [error, onError]);

    // Memoize the HTML object to prevent re-renders of the SVG DOM node
    // when other state (tooltip) changes.
    const svgMarkup = React.useMemo(() => ({ __html: svgContent || '' }), [svgContent]);

    // Refs to access latest state inside stable event listeners

    const trendDataRef = useRef(trendData);

    useEffect(() => {
        trendDataRef.current = trendData;
    }, [trendData]);

    // Coloring Logic (kept separate to react to trendData changes visually)
    useEffect(() => {
        if (!containerRef.current || !svgContent) return;

        const container = containerRef.current;
        const svgElement = container.querySelector('svg');
        if (!svgElement) return;

        // Reset all paths first
        container.querySelectorAll('path.ward').forEach((path) => {
            (path as SVGPathElement).style.fill = '#e2e8f0'; // Default slate-200
            (path as SVGPathElement).style.cursor = 'pointer';
        });

        if (trendData?.wardInfo) {
            Object.values(trendData.wardInfo).forEach((ward) => {
                const wardNo = ward.wardNo;
                const path = container.querySelector<SVGPathElement>(`#ward-${wardNo}`);

                if (path) {
                    let color = '#e2e8f0';
                    const winner = ward.winner;
                    const topCandidate = ward.candidates?.[0];
                    const secondCandidate = ward.candidates?.[1];
                    const isUncontested = ward.candidates?.length === 1;

                    // Check for Tie/Hung
                    const isHung = !isUncontested && topCandidate && secondCandidate && topCandidate.votes > 0 && topCandidate.votes === secondCandidate.votes;

                    // Implicit lead logic: standard lead OR uncontested
                    const isImplicitLead = !winner && !ward.leading && topCandidate && (topCandidate.votes > 0 || isUncontested);
                    const leader = ward.leading || (isImplicitLead ? topCandidate : undefined);

                    if (isHung) {
                        color = '#7e22ce'; // Purple for Hung
                    } else if (winner) {
                        switch (winner.group) {
                            case 'LDF': color = '#ef4444'; break;
                            case 'UDF': color = '#2768F5'; break;
                            case 'NDA': color = '#f97316'; break;
                            default: color = '#64748b'; break;
                        }
                    } else if (leader) {
                        switch (leader.group) {
                            case 'LDF': color = '#fca5a5'; break;
                            case 'UDF': color = '#93c5fd'; break; // lighter blue
                            case 'NDA': color = '#fdba74'; break;
                            default: color = '#cbd5e1'; break;
                        }
                    }
                    path.style.fill = color;
                }
            });
        }
    }, [svgContent, trendData]);

    // Event Handlers
    const handleMouseOver = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as SVGElement;
        // Check if target is a path with class 'ward'
        if ((target.tagName === 'path' && target.classList.contains('ward')) || (target.id && target.id.startsWith('ward-'))) {
            // Some browsers might not set classList reliably on SVG elements in all contexts, fallback to ID check
            const wardNo = target.getAttribute('data-ward');
            if (wardNo) {
                target.style.opacity = '0.8';

                // Update tooltip using ref data
                const currentTrend = trendDataRef.current;
                if (currentTrend?.wardInfo) {
                    const info = currentTrend.wardInfo[wardNo];
                    if (info) {
                        const isUncontested = info.candidates?.length === 1;
                        const topCandidate = info.candidates?.[0];
                        const secondCandidate = info.candidates?.[1];
                        const isHung = !isUncontested && topCandidate && secondCandidate && topCandidate.votes > 0 && topCandidate.votes === secondCandidate.votes;

                        setTooltip({
                            x: e.clientX,
                            y: e.clientY,
                            content: (
                                <div className="text-xs">
                                    <div className="font-bold">Ward {wardNo}: {info.wardName}</div>
                                    {isHung ? (
                                        <div className="text-purple-700 font-bold">
                                            HUNG / TIE ({topCandidate?.votes} votes)
                                            <div className="text-[10px] font-normal text-slate-600">
                                                {topCandidate?.name} vs {secondCandidate?.name}
                                            </div>
                                        </div>
                                    ) : info.winner ? (
                                        <div className="text-green-600 font-semibold">{info.winner.name} ({info.winner.group}) - Won</div>
                                    ) : isUncontested && topCandidate ? (
                                        <div className="text-slate-600 font-semibold">{topCandidate.name} ({topCandidate.group}) - Uncontested</div>
                                    ) : info.leading ? (
                                        <div className="text-blue-600 font-semibold">{info.leading.name} ({info.leading.group}) - Leading</div>
                                    ) : (
                                        <div className="text-slate-500">No result</div>
                                    )}
                                </div>
                            )
                        });
                    }
                }
            }
        }
    };

    const handleMouseOut = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as SVGElement;
        if (target.tagName === 'path' && target.classList.contains('ward')) {
            target.style.opacity = '1';
            setTooltip(null);
        }
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (tooltip) {
            setTooltip(prev => prev ? ({ ...prev, x: e.clientX, y: e.clientY }) : null);
        }
    };

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const target = e.target as SVGElement;
        if (target.tagName === 'path' && target.classList.contains('ward')) {
            const wardNo = target.getAttribute('data-ward');
            if (wardNo && onWardClick) {
                onWardClick(wardNo);
            }
        }
    };

    if (isLoading) return <div className="h-full w-full flex items-center justify-center text-slate-400">Loading Map...</div>;
    if (error) return <div className="h-full w-full flex items-center justify-center text-red-400">Map not available</div>;

    return (
        <div className="relative w-full h-full bg-slate-100 flex items-center justify-center p-4 overflow-hidden">
            {/* Force SVG styles via CSS to avoid JS flicker */}
            <style>{`
                .svg-container svg {
                    width: 100%;
                    height: 100%;
                    display: block;
                    overflow: hidden;
                }
            `}</style>
            <div
                ref={containerRef}
                className="w-full h-full flex items-center justify-center svg-container"
                dangerouslySetInnerHTML={svgMarkup}
                onMouseOver={handleMouseOver}
                onMouseOut={handleMouseOut}
                onMouseMove={handleMouseMove}
                onClick={handleClick}
            />

            {/* Tooltip Portal */}
            {tooltip && createPortal(
                <div
                    className="fixed z-[9999] bg-white px-3 py-2 rounded shadow-lg border border-slate-200 pointer-events-none transform -translate-x-1/2 -translate-y-full mt-[-8px]"
                    style={{ left: tooltip.x, top: tooltip.y }}
                >
                    {tooltip.content}
                </div>,
                document.body
            )}
        </div>
    );
};
