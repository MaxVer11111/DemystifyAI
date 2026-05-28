import { Container } from "@/components/layout/Container";
import { CourseCard } from "@/components/courses/CourseCard";
import { COURSE_CATEGORIES } from "@/data/courses";

export default function CoursesPage() {
  return (
    <main>
      <Container>
        <section className="courses-hero">
          <h1>Courses</h1>
          <p className="desc">
            Structured learning paths for every stage of your AI journey — from
            absolute beginner to production practitioner.
          </p>
        </section>

        <section className="category-grid">
          {COURSE_CATEGORIES.map((cat) => (
            <CourseCard key={cat.id} category={cat} />
          ))}
        </section>
      </Container>
    </main>
  );
}
