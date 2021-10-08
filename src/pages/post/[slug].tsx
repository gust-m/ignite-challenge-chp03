import { format } from 'date-fns';
import { GetStaticPaths, GetStaticProps } from 'next';

import ptBR from 'date-fns/locale/pt-BR';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import { RichText } from 'prismic-dom';
import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      }[];
    }[];
  };
}

interface PostProps {
  post: Post;
}

export default function Post({ post }: PostProps): JSX.Element {
  console.log(post.data.content);
  return (
    <>
      <Head>
        <title>{post.data.title}</title>
      </Head>

      <main>
        <img src={post.data.banner.url} alt="logo" />
        <article>
          <h1>{post.data.title}</h1>
          <time>
            <FiCalendar />
            {post.first_publication_date}
          </time>
          <p>
            <FiUser />
            {post.data.author}
          </p>

          {/* <div dangerouslySetInnerHTML={{ __html: post.data.content }} /> */}
        </article>
      </main>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // const prismic = getPrismicClient();
  // const posts = await prismic.query(TODO);
  return {
    paths: [],
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;

  const prismic = getPrismicClient();
  console.log(slug);
  const response = await prismic.getByUID('posts', String(slug), {});

  // console.log(JSON.stringify(response, null, 2));

  const post = {
    slug: response.uid,
    data: {
      title: response.data.title,
      author: response.data.author,
      content: {
        heading: response.data.content.heading,
        body: RichText.asHtml(response.data.content),
      },
      banner: response.data.main.url,
    },
    first_publication_date: format(
      new Date(response.first_publication_date),
      'dd eeeeee uuuu',
      {
        locale: ptBR,
      }
    ),
  };

  console.log(post);

  return {
    props: {
      post,
    },
    revalidate: 30 * 60, // 30 minutes
  };
};
