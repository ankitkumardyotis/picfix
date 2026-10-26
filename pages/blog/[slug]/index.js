import { Box, Container, Typography, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Image from 'next/image';
import Link from 'next/link';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { blogPosts } from '../../../data/blogPosts';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4fd1c5',
    },
    secondary: {
      main: '#fbbf24',
    },
  },
});

export async function generateMetadata({ params }) {
  const post = blogPosts.find(post => post.slug === params.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found",
      description: "The requested blog post could not be found.",
    };
  }

  return {
    title: `${post.title} | PicFix.AI Blog`,
    description: post.description,
    keywords: "ai photo enhancer, photo enhancement, image quality improvement, photo restoration ai",
  };
}

export async function getStaticPaths() {
  const paths = blogPosts.map((post) => ({
    params: { slug: post.slug },
  }));

  return {
    paths,
    fallback: false, // can also be true or 'blocking'
  };
}

export async function getStaticProps({ params }) {
  const post = blogPosts.find((post) => post.slug === params.slug);

  if (!post) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      post,
    },
  };
}

export default function BlogPostPage({ post }) {
  if (!post) {
    return (
      <ThemeProvider theme={theme}>
        <Box sx={{ minHeight: '100vh', py: 8 }}>
          <Container maxWidth="md">
            <Typography variant="h2">Blog Post Not Found</Typography>
          </Container>
        </Box>
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <Box sx={{ minHeight: '100vh', py: 8 }}>
        <Container maxWidth="lg">
          <Link href="/blog" passHref>
            <Button startIcon={<ArrowBackIcon />} sx={{ mb: 4 }}>
              Back to Blog
            </Button>
          </Link>
          <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {post.video ? (
              // A post with a video shows it at the top instead of the cover image.
              // The cover image is still used for the blog cards, and the poster shows until the video loads.
              <>
                <video
                  src={post.video}
                  poster={post.videoPoster || post.image}
                  controls
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="metadata"
                  aria-label={post.title}
                  style={{ width: '100%', maxHeight: '75vh', objectFit: 'contain', display: 'block', borderRadius: '8px', backgroundColor: '#000' }}
                />
                {post.videoCaption && (
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
                    {post.videoCaption}
                  </Typography>
                )}
              </>
            ) : (
              <Image
                src={post.image}
                alt={post.title}
                width={1200}
                height={600}
                style={{ maxWidth: '100%', height: 'auto', display: 'block', borderRadius: '8px' }}
              />
            )}
          </Box>
          <Typography variant="h3"  gutterBottom>
            {post.title}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, color: 'text.secondary', mb: 4 }}>
            <Typography variant="body2">{post.date}</Typography>
            <Typography variant="body2">•</Typography>
            <Typography variant="body2">{post.category}</Typography>
          </Box>
          <Box
            dangerouslySetInnerHTML={{ __html: post.content }}
            sx={{
              '& h2': {
                fontSize: '1.875rem',
                fontWeight: 600,
                mt: 6,
                mb: 3,
                color: 'text.primary',
              },
              '& p': {
                fontSize: '1.125rem',
                lineHeight: 1.8,
                mb: 4,
                color: 'text.secondary',
              },
              '& strong': {
                color: 'text.primary',
                fontWeight: 600,
              },
              '& ul': {
                pl: 4,
                mb: 4,
              },
              '& li': {
                fontSize: '1.125rem',
                lineHeight: 1.8,
                color: 'text.secondary',
                mb: 2,
              },
              '& a': {
                color: 'primary.main',
                textDecoration: 'none',
                '&:hover': {
                  textDecoration: 'underline',
                },
              },
            }}
          />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

