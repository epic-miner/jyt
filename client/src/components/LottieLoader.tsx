import { useMemo } from 'react';
import Lottie from 'lottie-react';
import { cn } from '@/lib/utils';

// Animation data for different types
const animationData = {
  loading: {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 90,
    w: 400,
    h: 400,
    nm: "Loading Animation",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Circle",
        sr: 1,
        ks: {
          o: { a: 0, k: 100, ix: 11 },
          r: {
            a: 1,
            k: [
              { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
              { t: 90, s: [360] }
            ],
            ix: 10
          },
          p: { a: 0, k: [200, 200, 0], ix: 2, l: 2 },
          a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
          s: { a: 0, k: [100, 100, 100], ix: 6, l: 2 }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                d: 1,
                ty: "el",
                s: { a: 0, k: [150, 150], ix: 2 },
                p: { a: 0, k: [0, 0], ix: 3 },
                nm: "Ellipse Path 1",
                mn: "ADBE Vector Shape - Ellipse",
                hd: false
              },
              {
                ty: "st",
                c: { a: 0, k: [0.482352941176, 0.282352941176, 0.8, 1], ix: 3 },
                o: { a: 0, k: 100, ix: 4 },
                w: { a: 0, k: 20, ix: 5 },
                lc: 2,
                lj: 1,
                ml: 4,
                bm: 0,
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false
              },
              {
                ty: "tm",
                s: { a: 0, k: 0, ix: 1 },
                e: { a: 0, k: 25, ix: 2 },
                o: {
                  a: 1,
                  k: [
                    { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 0, s: [0] },
                    { t: 90, s: [360] }
                  ],
                  ix: 3
                },
                m: 1,
                ix: 3,
                nm: "Trim Paths 1",
                mn: "ADBE Vector Filter - Trim",
                hd: false
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0], ix: 2 },
                a: { a: 0, k: [0, 0], ix: 1 },
                s: { a: 0, k: [100, 100], ix: 3 },
                r: { a: 0, k: 0, ix: 6 },
                o: { a: 0, k: 100, ix: 7 },
                sk: { a: 0, k: 0, ix: 4 },
                sa: { a: 0, k: 0, ix: 5 },
                nm: "Transform"
              }
            ],
            nm: "Ellipse 1",
            np: 3,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            hd: false
          }
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0
      }
    ],
    markers: []
  },
  success: {
    v: "5.7.4",
    fr: 60,
    ip: 0,
    op: 90,
    w: 400,
    h: 400,
    nm: "Success Animation",
    ddd: 0,
    assets: [],
    layers: [
      {
        ddd: 0,
        ind: 1,
        ty: 4,
        nm: "Checkmark",
        sr: 1,
        ks: {
          o: { a: 0, k: 100, ix: 11 },
          r: { a: 0, k: 0, ix: 10 },
          p: { a: 0, k: [200, 200, 0], ix: 2, l: 2 },
          a: { a: 0, k: [0, 0, 0], ix: 1, l: 2 },
          s: { 
            a: 1, 
            k: [
              { i: { x: [0.667, 0.667, 0.667], y: [1, 1, 1] }, o: { x: [0.333, 0.333, 0.333], y: [0, 0, 0] }, t: 30, s: [0, 0, 100] },
              { t: 60, s: [100, 100, 100] }
            ], 
            ix: 6, 
            l: 2 
          }
        },
        ao: 0,
        shapes: [
          {
            ty: "gr",
            it: [
              {
                ind: 0,
                ty: "sh",
                ix: 1,
                ks: {
                  a: 0,
                  k: {
                    i: [[0, 0], [0, 0], [0, 0]],
                    o: [[0, 0], [0, 0], [0, 0]],
                    v: [[-50, 0], [-15, 35], [50, -50]],
                    c: false
                  },
                  ix: 2
                },
                nm: "Path 1",
                mn: "ADBE Vector Shape - Group",
                hd: false
              },
              {
                ty: "st",
                c: { a: 0, k: [0.4, 0.8, 0.4, 1], ix: 3 },
                o: { a: 0, k: 100, ix: 4 },
                w: { a: 0, k: 20, ix: 5 },
                lc: 2,
                lj: 2,
                bm: 0,
                nm: "Stroke 1",
                mn: "ADBE Vector Graphic - Stroke",
                hd: false
              },
              {
                ty: "tr",
                p: { a: 0, k: [0, 0], ix: 2 },
                a: { a: 0, k: [0, 0], ix: 1 },
                s: { a: 0, k: [100, 100], ix: 3 },
                r: { a: 0, k: 0, ix: 6 },
                o: { a: 0, k: 100, ix: 7 },
                sk: { a: 0, k: 0, ix: 4 },
                sa: { a: 0, k: 0, ix: 5 },
                nm: "Transform"
              }
            ],
            nm: "Checkmark",
            np: 3,
            cix: 2,
            bm: 0,
            ix: 1,
            mn: "ADBE Vector Group",
            hd: false
          }
        ],
        ip: 0,
        op: 90,
        st: 0,
        bm: 0
      }
    ],
    markers: []
  }
};

interface LottieLoaderProps {
  type?: 'loading' | 'success' | 'error';
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animationData?: any; // Custom animation data
}

const LottieLoader = ({
  type = 'loading',
  className,
  loop = true,
  autoplay = true,
  size = 'md',
  animationData: customAnimationData,
}: LottieLoaderProps) => {
  
  const sizeClass = useMemo(() => {
    switch (size) {
      case 'sm': return 'w-16 h-16';
      case 'lg': return 'w-32 h-32';
      case 'md':
      default: return 'w-24 h-24';
    }
  }, [size]);

  return (
    <div className={cn('flex items-center justify-center', sizeClass, className)}>
      <Lottie 
        animationData={customAnimationData || animationData[type]}
        loop={loop}
        autoplay={autoplay}
        className="w-full h-full"
      />
    </div>
  );
};

export default LottieLoader;